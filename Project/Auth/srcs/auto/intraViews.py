from django.views import View
from .tokenService import TokenService
from .tools import image_intra_create, username_check
from .translate_way import get_translated_message
from django.http import JsonResponse
from .models import Users
import requests
import os

class IntraRequest(View):
    # İntra Login
    def intra_login(request):
        UID = os.environ.get("UID")
        redirect_uri = os.environ.get("REDURECT_URI") 
        auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={UID}&redirect_uri={redirect_uri}&response_type=code"
        return JsonResponse({'url': auth_url}, status=200)

    # İntra Callback
    def callback(request, code):
        user_language = request.headers.get("Accept-Language", "tr")
        if not code:
            return JsonResponse({"error": get_translated_message("AUTH_CODE_NOT_FOUND_CALLBACK", user_language)}, status=400)

        UID = os.environ.get("UID")
        SECRET = os.environ.get("SECRET")
        redirect_uri = os.environ.get("REDURECT_URI") 
        token_url = "https://api.intra.42.fr/oauth/token"
        
        data = {
            'grant_type': 'authorization_code',
            'client_id': UID,
            'client_secret': SECRET,
            'code': code,
            'redirect_uri': redirect_uri
        }

        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_FETCH_ERROR", user_language)}, status=response.status_code)
        token = response.json()
        access_token = token.get('access_token')
        if not access_token:
            return JsonResponse({"error": get_translated_message("INTRA_ACCESS_TOKEN_NOT_FOUND", user_language)}, status=400)

    # Kullanıcı bilgilerini çekmek için token'ı kullanın
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        user_response = requests.get(user_info_url, headers=headers)
        if user_response.status_code != 200:
            return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", user_language)}, status=user_response.status_code)
        data = user_response.json()

        username = data.get('login')
        intra_access_token, access_exp = TokenService.generate_access_token(username)
        refresh_token, refresh_exp = TokenService.generate_refresh_token(username)

        token = {
            "username": username,
            "access_token": {"token": intra_access_token, "expiration_date": access_exp},
            "refresh_token": {
                "token": refresh_token,
                "expiration_date": refresh_exp,
            },
        }
        
        if username_check(username):
            user = Users.objects.get(username=username)
            user.access_token = intra_access_token
            user.refresh_token = refresh_token
            user.save()
            return(JsonResponse({'message': token,}, status=201))
        
        user = Users.objects.create(
            username = username,
            email= data["email"],
            is_active= True,
            refresh_token= refresh_token,
            access_token= intra_access_token
        )

        avatar_url =  data.get('image').get('link')
        headers = {"Accept-Language": "application/json"}
        user_data = {
            "first_name" : data.get('first_name'),
            "last_name" : data.get('last_name'),
            "username" : data.get('login'),
            "email" : data.get('email'),
            "password": "default",
            "avatar" : image_intra_create(avatar_url),
        }

        user_service_response = requests.post(f"http://project-users-1:8000/postjson/", json=user_data, headers=headers)
        if user_service_response.status_code != 201:
            user.delete()
            return JsonResponse({'error': user_service_response.status_code, 'message': user_service_response.json()}, status=user_service_response.status_code)
        

        return(JsonResponse({'message': token,}, status=201))
