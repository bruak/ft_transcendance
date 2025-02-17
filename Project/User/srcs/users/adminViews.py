from django.views import View
from django.http import  JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import UserSerializer
from .serializers import AdminSerializer
from .translate_way import get_translated_message
import requests

class UserAdminRequest(View):
        def dispatch(self, request, *args, **kwargs):
            user_language = request.headers.get("Accept-Language", "tr")
            
            token = request.headers.get("Authorization")
            print(token)
            print(12)
            if not token or not self.validate_admin(request):
                print(11)
                return JsonResponse({"error": get_translated_message("REQUEST_FAILED", user_language)}, status=403)
            print(12)
            return super().dispatch(request, *args, **kwargs)
        
        # Admin
        def adminlist(request, username):
            user_language = request.headers.get("Accept-Language", "tr")
            if request.method != "GET":
                return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
            try:
                user = User.objects.get(username=username)  # Tek bir kullanıcı döner
                serializer = AdminSerializer(user)  # Tekil kullanıcı için many=False (varsayılan)
                return JsonResponse({'message': serializer.data}, status=200)
            except User.DoesNotExist:
                return JsonResponse({"message": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
            except Exception as e:
                return JsonResponse({"error": get_translated_message("USER_FETCH_ERROR", user_language)}, status=500)

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
            
        # Admin getting user information for admin page. Beaceuse of this, we need to use correct user information. 
        # so, if we use the default get_user method, we can get the admin information and delete the admin account.
        # off course its not a good idea. So, we need to create a new method for getting user information for admin page.
        
        def user_get(request, username):
            user_language = request.headers.get("Accept-Language", "tr")
            if request.method != "GET":
                return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
            try:
                User = User.objects.get(username=username)
                serializer = UserSerializer(User)
                return JsonResponse(serializer.data, status=200)
            
            except User.DoesNotExist:
                return JsonResponse({"message": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
            
        
        def validate_admin(self, request):
            """Validates the admin token using the request headers."""
            token = request.headers.get("Authorization")
            if not token:
                return False
            response = requests.get("http://project-auth-1:8000/validate_admin/", headers=request.headers)
            return response.status_code == 200