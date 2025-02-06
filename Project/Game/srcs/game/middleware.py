import json
import urllib.parse
import requests
from asgiref.sync import sync_to_async

# Doğrulama servisinize ait URL (auth servisinde yer alan token doğrulama endpoint'i)
AUTH_VALIDATE_URL = "http://project-auth-1:8000/validate-token/"

class GameWSAuthMiddleware:
	def __init__(self, inner):
		self.inner = inner

	async def __call__(self, scope, receive, send):
		# Sadece websocket bağlantıları için çalışır
		if scope["type"] != "websocket":
			inner = self.inner(scope)
			return await inner(receive, send)

		# Query string içerisinden token bilgisini ayıklama
		query_string = scope.get("query_string", b"").decode()
		query_params = urllib.parse.parse_qs(query_string)
		token = None

		# Token, header ya da query param olarak gelebilir
		headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
		token = headers.get("authorization")
		if not token:
			token_list = query_params.get("token")
			if token_list:
				token = token_list[0]

		# Eğer token bulunamazsa, hata mesajı gönderip bağlantıyı kapatın.
		if not token:
			await self._send_ws_error(send, "MISSING_TOKEN", 4001)
			return

		# Token doğrulama isteği (senkron istek; performans gereksinimlerinize göre httpx gibi asenkron kütüphane tercih edilebilir)
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

		# Doğrulama başarılı ise, isteğe ek bilgiler ekleyebilir veya doğrudan consumer'a geçebilirsiniz.
		# Örneğin, response içerisindeki kullanıcı bilgilerini scope'a eklemek için:
		try:
			user_data = response.json()
			scope["user"] = user_data  # Burada, user_data sizin JWT içerisinden çektiğiniz veya auth servisinden aldığınız veriler olabilir.
		except Exception:
			scope["user"] = None

		# Bağlantıya devam etmek için iç uygulamaya geçiyoruz.
		return await self.inner(scope, receive, send)


	async def _send_ws_error(self, send, message_key, close_code):
		await send({"type": "websocket.accept"})
		await send({
			"type": "websocket.send",
			"text": json.dumps({
				"error": "error",
			})
		})
		await send({"type": "websocket.close", "code": close_code})
