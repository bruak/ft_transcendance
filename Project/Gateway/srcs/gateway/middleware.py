import requests
from django.http import JsonResponse
from .translate_way import get_translated_message

SERVICES = {
	"auth": "http://auth:8000",
	"user": "http://users:8000",
	"game": "http://game:8000",
	"mail": "http://mail:8000",
	"friend": "http://project-friend-1:8000",
}

EXCLUDED_PATHS = [
	"singin",
	"twofactor",
	"singup",
	"verify-account",
	"intra",
	"callback",
	"api" # değişicek
]

class ProxyMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		return response

	def process_view(self, request, view_func, view_args, view_kwargs):
		user_language = request.headers.get("Accept-Language", "tr")
		print(f"request path: {request.path}")

		path_parts = request.path.strip("/").split("/")
		if len(path_parts) >= 2:
			service = path_parts[0]  # İlk kısım servisin adı
			path = "/".join(path_parts[1:])  # Yolun geri kalanını birleştiriyoruz
			if 'code' in request.GET:
				code_value = request.GET.get('code')
				path += f"/{code_value}"

			service_url = SERVICES.get(service)
			print(f"path: {path}")
			if not service_url:
				return JsonResponse({'message': get_translated_message("SERVICE_NOT_FOUND", user_language)}, status=404)  # Servis bulunamazsa 404 döneriz
			print(f"lll: {path}")
			if not any(path.startswith(excluded) for excluded in EXCLUDED_PATHS):
				# Token kontrolü yapıyoruz
				token = request.headers.get('Authorization')
				if not token:
					return JsonResponse({'error': get_translated_message("MISSING_TOKEN", user_language)}, status=401)  # Token eksikse 401 döneriz
				# Token doğrulama isteği gönderiyoruz
				response = requests.get(f"http://project-auth-1:8000/validate-token/", headers=request.headers)
				if response.status_code != 200:
					return JsonResponse({'error': get_translated_message("INVALID_VALIDATE_TOKEN", user_language)}, status=response.status_code)
			request.path = f"{service_url}/{path}/"
			print(f"asfa: {request.path}")
		else:
			return JsonResponse({'error': get_translated_message("INVALID_PATH_ARGUMENT", user_language)}, status=500)
		return None  # Eğer her şey yolundaysa view fonksiyonuna geçeriz
