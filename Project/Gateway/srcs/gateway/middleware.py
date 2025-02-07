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
    "api",  # değişicek
]

AUTH_VALIDATION_URL = "http://project-auth-1:8000/validate-token/"


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
        print(f"Updated request path: {request.path}")

        return None  # Continue to the view

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
