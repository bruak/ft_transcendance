import json
import urllib.parse
import requests
from asgiref.sync import sync_to_async
from asyncio import Lock, get_running_loop

AUTH_VALIDATE_URL = "http://project-auth-1:8000/validate-token/"

# Global dictionary to track active tokens
active_tokens = {}
active_tokens_lock = None  # Lock will be created in the event loop


class GameWSAuthMiddleware:
	def __init__(self, inner):
		self.inner = inner

	async def __call__(self, scope, receive, send):
		global active_tokens_lock

		if not active_tokens_lock:
			# Create the lock dynamically within an event loop
			active_tokens_lock = Lock()

		if scope["type"] != "websocket":
			inner = self.inner(scope)
			return await inner(receive, send)

		# Parse query string to extract token
		query_string = scope.get("query_string", b"").decode()
		query_params = urllib.parse.parse_qs(query_string)
		token = None

		headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
		token = headers.get("authorization")
		if not token:
			token_list = query_params.get("token")
			if token_list:
				token = token_list[0]

		if not token:
			await self._send_ws_error(send, "MISSING_TOKEN", 4001)
			return

		# Validate token with the external service
		try:
			response = await sync_to_async(requests.get)(
				AUTH_VALIDATE_URL,
				headers={"Authorization": f"Bearer {token}"}
			)
		except Exception:
			await self._send_ws_error(send, "INVALID_VALIDATE_TOKEN", 4002)
			return

		if response.status_code != 200:
			await self._send_ws_error(send, "INVALID_VALIDATE_TOKEN", 4003)
			return

		# Check if token is already in use
		async with active_tokens_lock:
			if token in active_tokens:
				await self._send_ws_error(send, "TOKEN_ALREADY_IN_USE", 4004)
				return

			# Register the token for this connection
			active_tokens[token] = send

		# Proceed with the WebSocket connection
		try:
			return await self.inner(scope, receive, send)
		finally:
			# Cleanup token when the connection closes
			async with active_tokens_lock:
				if token in active_tokens:
					del active_tokens[token]

	async def _send_ws_error(self, send, message_key, close_code):
		await send({"type": "websocket.accept"})
		await send({
			"type": "websocket.send",
			"text": json.dumps({
				"error": message_key,
			})
		})
		await send({"type": "websocket.close", "code": close_code})
