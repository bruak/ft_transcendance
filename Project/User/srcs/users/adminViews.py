from django.views import View
from django.http import  JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import UserSerializer
from .translate_way import get_translated_message
import requests

class UserAdminRequest(View):
    # Admin
    @csrf_exempt
    def user_delete(request, username):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "DELETE":
            return JsonResponse({"error": get_translated_message("ONLY_DELETE_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            user = User.objects.get(username=username)
            user.delete()  # Delete the user
            return JsonResponse({"message": get_translated_message("SUCCESSFUL", user_language)}, status=200)
        except User.DoesNotExist:
            return JsonResponse({"error": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
        except Exception as e:
            return JsonResponse({"error": get_translated_message("USER_DELETE_ERROR", user_language), "str": str(e)}, status=500)
        
    def user_get(request, username):
        """
        @brief Retrieve user information specifically for the admin page.  

        @param user_id: The ID of the user to fetch.  
        @return User object with the correct information, ensuring admin safety.  

        @note Using the default get_user method may return admin details,  
        which could lead to accidental deletion of the admin account.  
        This method ensures only the intended user data is retrieved.  
        """
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            user = User.objects.get(username=username)
            serializer = UserSerializer(user)
            return JsonResponse({'message' :serializer.data}, status=200)
        
        except User.DoesNotExist:
            return JsonResponse({"message": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
    
    @csrf_exempt
    def user_list(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            obj = User.objects.all()
            serializer = UserSerializer(obj, many=True)
            return JsonResponse({'message': serializer.data}, safe=False, status=200)
        except Exception as e:
            return JsonResponse({"error": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)

