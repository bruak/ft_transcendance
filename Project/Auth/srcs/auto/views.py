from .models import Users
from .translate_way import get_translated_message
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from .models import Users
from .tokenService import TokenService
from .tools import access_token_validate
from .translate_way import get_translated_message
from django.http import JsonResponse
from django.db.models import Q

class MiscRequest(View):

    @csrf_exempt
    def user_exists(request, username):
        user_language = request.headers.get("Accept-Language", "tr")
        
        if request.method != "GET":
            return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)

        try:
            Users.objects.get(Q(username=username) | Q(email=username))
            return JsonResponse({"exists": True}, status=200)
        
        except Users.DoesNotExist:
            return JsonResponse({"exists": False}, status=404)

    def validate_get_username(request):
        """
        @brief Validate access token and return the user's username.
    
        @param request: HTTP request containing the Authorization header.
        @return: JSON response with the username if valid, otherwise an error message.
        """

        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        
        access_token = access_token_validate(request.headers.get("Authorization"))
        if access_token is None:
            return JsonResponse( {'error': get_translated_message("INVALID_VALIDATE_TOKEN", user_language)}, status=401)
            
        try:
            username = TokenService.validate_access_token(access_token)
            return JsonResponse( {'message': {'username':username }}, status=200)
        except Exception as e:
            return JsonResponse({'error': get_translated_message("TOKEN_VALIDATION_ERROR", user_language)}, status=401)
