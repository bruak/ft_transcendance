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
    "forget_password",
    "reset_password",
    "userexists",
    "validate_mail_token",
    "api",  # değişicek
]

ADMIN_PATHS = [
  #  "http://auth:8000/validate_admin/", bu admin diye kontrol edicek
    #"http://auth:8000/delete/",
    "http://auth:8000/listtwofactor/",
    #"http://auth:8000/listusers/",
    "http://auth:8000/listmail/",
    "http://users:8000/list/",
    #"http://users:8000/delete/",
    "http://friend:8000/friend_list/",
]

AUTH_VALIDATION_URL = "http://project-auth-1:8000/validate-token/"
ADMIN_VALIDATION_URL = "http://project-auth-1:8000/validate_admin/" 

class ProxyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        user_language = request.headers.get("Accept-Language", "tr")
        print(f"Request path: {request.path}")

        service, path = self.extract_service_and_path(request)
        if not service:
            return self.json_response("INVALID_PATH_ARGUMENT", user_language, 500)

        service_url = SERVICES.get(service)
        if not service_url:
            return self.json_response("SERVICE_NOT_FOUND", user_language, 404)

        if not self.is_excluded_path(path) and not self.validate_token(request, user_language):
            return self.json_response("INVALID_VALIDATE_TOKEN", user_language, 401)
        
        request.path = f"{service_url}/{path}/"
        if self.is_admin_path(request.path) and not self.validate_admin(request):
            return self.json_response("INVALID_VALIDATE_TOKEN", user_language, 401)
            
        print(f"Updated request path: {request.path}")

        return None  # Continue to the view
        """       - ./Auth/srcs/media/avatars:/run/nginx/html/src/media/avatars - ./Frontend:/run/nginx/html """

    def extract_service_and_path(self, request):
        """Extracts service name and remaining path from the request."""
        path_parts = request.path.strip("/").split("/")
        if len(path_parts) < 2:
            return None, None

        service = path_parts[0]
        path = "/".join(path_parts[1:])
        
        if 'code' in request.GET:
            path += f"/{request.GET.get('code')}"

        return service, path

    def is_excluded_path(self, path):
        """Checks if the path is in the excluded paths list."""
        return any(path.startswith(excluded) for excluded in EXCLUDED_PATHS)

    def validate_token(self, request, user_language):
        """Validates the authentication token."""
        token = request.headers.get("Authorization")
        if not token:
            return False

        response = requests.get(AUTH_VALIDATION_URL, headers=request.headers)
        return response.status_code == 200

    def json_response(self, message_key, language, status):
        """Returns a standardized JSON response."""
        return JsonResponse({'message': get_translated_message(message_key, language)}, status=status)
    def is_admin_path(self, path):
        """Checks if the path is in the admin paths list."""
        return any(path.startswith(admin) for admin in ADMIN_PATHS)
    
    def validate_admin(self, request):
        """Validates the authentication token."""
        token = request.headers.get("Authorization")
        if not token:
            return False
    
        response = requests.get(ADMIN_VALIDATION_URL, headers=request.headers)
        return response.status_code == 200
