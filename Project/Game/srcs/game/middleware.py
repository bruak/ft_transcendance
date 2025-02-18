import json
import urllib.parse
import requests
from asgiref.sync import sync_to_async
from asyncio import Lock

AUTH_VALIDATE_URL = "http://project-auth-1:8000/validate-token/"

# Global dictionary to track active users: mapping channel_name -> username
active_users = {}
active_users_lock = None  # Lock will be created in the event loop

class GameWSAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        global active_users_lock
        if not active_users_lock:
            active_users_lock = Lock()

        if scope["type"] != "websocket":
            inner = self.inner(scope)
            return await inner(receive, send)

        # Parse query string or headers to extract token
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

        user_data = response.json()

        class SimpleUser:
            pass

        user = SimpleUser()
        user.username = user_data.get("username", "guest")
        scope["user"] = user

        channel_name = scope.get("channel_name")
        if not channel_name:
            channel_name = token

        async with active_users_lock:
            if user.username in active_users.values():
                await self._send_ws_error(send, "USER_ALREADY_CONNECTED", 4005)
                return
            active_users[channel_name] = user.username

        try:
            return await self.inner(scope, receive, send)
        finally:
            async with active_users_lock:
                if channel_name in active_users:
                    del active_users[channel_name]

    async def _send_ws_error(self, send, message_key, close_code):
        await send({"type": "websocket.accept"})
        await send({
            "type": "websocket.send",
            "text": json.dumps({
                "error": message_key,
            })
        })
        await send({"type": "websocket.close", "code": close_code})
