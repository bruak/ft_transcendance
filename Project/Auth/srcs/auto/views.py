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
from django.views.decorators.csrf import csrf_exempt

class MiscRequest(View):

    # User Kontrol
    @csrf_exempt
    def user_exists(request, username):
        user_language = request.headers.get("Accept-Language", "tr")
        
        if request.method != "GET":
            return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            Users.objects.get(username=username)
            return JsonResponse({"valid": True}, status=200)
        except Users.DoesNotExist:
            return JsonResponse({"valid": False}, status=404)

	# Get User (accsesToken -> UserName)
    def validate_get_username(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)},status=405)
        access_token = access_token_validate(request.headers.get("Authorization"))
        if access_token is None:
            return JsonResponse( {'error': get_translated_message("INVALID_VALIDATE_TOKEN", user_language)}, status=401)
            
        try:
            username = TokenService.validate_access_token(access_token)
            return JsonResponse( {'message': {'username':username }}, status=200)
        except Exception as e:
            return JsonResponse({'error': get_translated_message("TOKEN_VALIDATION_ERROR", user_language)},status=401)
