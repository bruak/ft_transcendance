import requests
from django.http import JsonResponse

SERVICES = {
	"auth": "http://auth:8000",
	"user": "http://users:8000",
	"game": "http://game:8000",
	"mail": "http://mail:8000",
	"friend": "http://friend:8000",
}

class ProxyMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		return response

	def process_view(self, request, view_func, view_args, view_kwargs):
		path_parts = request.path.strip("/").split("/")
		if len(path_parts) >= 2:
			service = path_parts[0]  # İlk kısım servisin adı
			path = path_parts[1]
			 # Servisin yol kısmı
			if len(path_parts) == 3:
				path = path + "/" + path_parts[2]
			service_url = SERVICES.get(service)
			if not service_url:
				return JsonResponse({'message': "Service not found"}, status=404)  # Servis bulunamazsa 404 döneriz
			if "singin" not in path and "twofactor" not in path and "singup" not in path and "verify-account" not in path:
				# Token kontrolü yapıyoruz
				token = request.headers.get('Authorization')
				if not token:
					return JsonResponse({'error': 'Missing token'}, status=401)  # Token eksikse 401 döneriz
				# Token doğrulama isteği gönderiyoruz
				response = requests.get(f"http://project-auth-1:8000/validate-token/", headers=request.headers)
				if response.status_code != 200:
					return JsonResponse({'error': "Geçersiz Validate Token"}, status=response.status_code)
			if len(path_parts) == 3:
				request.path = f"{service_url}/{path}"
			else:
				request.path = f"{service_url}/{path}/"
			print(request.path)
		else:
			return JsonResponse({'error': "Invalid Arguam"}, status=500)
		return None  # Eğer her şey yolundaysa view fonksiyonuna geçeriz
