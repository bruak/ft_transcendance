from .models import Users, MailTokens, TwofactorCodes
from django.views import View
from .tokenService import TokenService
from .tools import image_to_url, generate_random_code, access_token_validate, username_check
from .translate_way import get_translated_message
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
import os
import uuid
import requests

class UserRequest(View):
    
    # Updated (Accses Token)
    @csrf_exempt
    def user_update(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "POST":
            return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            auth = request.headers.get("Authorization")
            accesToken =  access_token_validate(auth)

            user = Users.objects.get(access_token=accesToken)
            
            userDB_response = requests.get(f"http://project-users-1:8000/getuser/{user.username}/", headers=request.headers)
            if userDB_response.status_code != 200:
                return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
            
            data = request.POST
            avatar = request.FILES.get('avatar', None)
            new_password = data.get('password', None)
            first_name = data.get('first_name', userDB_response.json().get('message').get('first_name'))
            last_name = data.get('last_name', userDB_response.json().get('message').get('last_name'))
            
            if new_password:
                user.password = make_password(new_password)

            if avatar:
                if avatar and os.path.exists(f"/app/{userDB_response.json().get('message').get('avatar')}"):
                    os.remove(f"/app/{userDB_response.json().get('message').get('avatar')}")
                new_avatar = image_to_url(avatar, user.username)
            else:
                new_avatar = userDB_response.json().get('message').get('avatar')

            user.save()

            headers = {"Accept-Language": user_language, "Authorization" : auth}
            user_data = {
                "username": user.username,
                "password": user.password,
                "avatar": new_avatar,
                "first_name": first_name,
                "last_name": last_name,
            }

            user_response = requests.post(f"http://project-users-1:8000/put/{user.username}/", json=user_data, headers=headers )

            if user_response.status_code != 200:
                return JsonResponse({'error': get_translated_message("USER_UPDATE_ERROR", user_language)}, status=500)

            return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)
        
        except Users.DoesNotExist:
            return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
        
        except Exception as e:
            return JsonResponse({'error': get_translated_message("USER_UPDATE_ERROR", user_language), 'exception': str(e)}, status=500)

    # User Login
    @csrf_exempt
    def singin(request):
        if request.method == "POST":
            data = JSONParser().parse(request)
            singin = data.get("sign")
            password = data.get("password")

            user_language = request.headers.get("Accept-Language", "tr") #http isteğinden gelen header eğer yoksa default olarak tr olur.

            try:
                user = (
                    Users.objects.get(email=singin)
                    if "@" in singin
                    else Users.objects.get(username=singin)
                )
                if not check_password(password, user.password):
                    return JsonResponse({'error': get_translated_message("USER_PASSWORD_ERROR", user_language)}, status=401)
                code = generate_random_code()
                try:
                    twouser = TwofactorCodes.objects.get(user=user, status=True)
                except Exception as e:
                    TwofactorCodes.objects.create(
                        user = user,
                        code = code,
                        expiration = TokenService.create_expiration_date(15),
                    )
                    mail_data = {
                        "email": user.email,
                        "code": code
                    }
                    headers = {"Accept-Language": "application/json"}
                    mail_response = requests.post(f"http://project-mail-1:8000/api/2fa/", json=mail_data, headers=headers)
                    if (mail_response.status_code != 200):
                        return JsonResponse({'error': get_translated_message("MAIL_NOT_SENT", user_language)}, status=500)

                return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)

            except Exception as e:
                return JsonResponse({'error': get_translated_message("NOT_FOUND_USER", user_language)}, status=404)
        else:
            return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)


    # User Register
    @csrf_exempt
    def singup(request):
        user_language = request.headers.get("Accept-Language", "tr")

        if request.method != "POST":
            return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            first_name = request.POST.get('first_name')
            last_name = request.POST.get('last_name')
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            avatar_file = request.FILES.get('avatar', None)

            if username_check(username):
                return JsonResponse({'error': get_translated_message("USERNAME_EXISTS", user_language)}, status=409)
            if Users.objects.filter(email=email).exists():
                return JsonResponse({'error': get_translated_message("MAIL_ALREADY_EXISTS", user_language)}, status=409)

            avatar_url = image_to_url(avatar_file, username)

            hashed_password = make_password(password)

            user = Users.objects.create(
                username=username,
                email=email,
                password=hashed_password,
                is_active = False,
            )

            token = str(uuid.uuid4())
            MailTokens.objects.create(
                    user=user,
                    token=token,
                    type="verify",
                    expiration =  timezone.now() + timedelta(minutes=(60 * 24))
            )

            headers = {"Accept-Language": "application/json"}
            user_data = {
                "username": username,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "avatar": avatar_url,
                "password": hashed_password,
            }
            ip = os.getenv("DOMAIN")
            mail_url = f"{ip}/verify-email/{token}"
            mail_data = {
                "token": mail_url,
                "username" : username,
                "email": email,
            }
            
            mail_response = requests.post(f"http://project-mail-1:8000/api/verify/", json=mail_data, headers=headers)
            if mail_response.status_code != 200:
                return JsonResponse({'error': get_translated_message("MAIL_NOT_SENT", user_language)}, status=500)

            user_response = requests.post(f"http://project-users-1:8000/postjson/", json=user_data, headers=headers)

            if user_response.status_code != 201:
                user.delete()
                return JsonResponse({'error': get_translated_message("USER_SERVICE_PROBLEM", user_language)}, status=500)

            return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=201)
        except Exception as e:
            return JsonResponse({'error': get_translated_message("USER_SIGNUP_ERROR", user_language)}, status=500)


    #Kullanıcı Çıkış (Accses Token)
    @csrf_exempt
    def singout(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            header = request.headers.get("Authorization")
            if header.startswith("Bearer "):
                access_token = header.split(" ", 1)[1]
            else:
                return JsonResponse({'error': get_translated_message("INVALID_TOKEN_SIGNOUT", user_language)}, status=401)
            user = Users.objects.get(access_token=access_token)
            user.refresh_token = None
            user.access_token = None
            user.save()
            return JsonResponse({'message': get_translated_message("USER_SIGNOUT_SUCCESS", user_language)}, status=200)
        except Exception as e:
            return (JsonResponse({'error': get_translated_message("USER_SIGNOUT_PROBLEM", user_language)}, status=500))
