from django.views import View
from .models import Users, MailTokens, TwofactorCodes
from .tokenService import TokenService
from .tools import access_token_validate
from .translate_way import get_translated_message
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
import uuid


class AuthRequest(View):
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

    # Kullanıcı Two Factor Doğrulama 
    @csrf_exempt
    def twofactor(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "POST":
            return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            data = JSONParser().parse(request)
            username = data.get('username')
            code = data.get('code')
            user = Users.objects.get(username=username)
            if not user.is_active:
                return (JsonResponse({"error": get_translated_message("USER_AUTH_NOT_DONE", user_language)}, status=400))
            twofactor = TwofactorCodes.objects.get(user=user, code=code, status=True)
            if TokenService.is_mail_token_expired(twofactor.expiration):
                twofactor.status = False
                twofactor.save()
                return (JsonResponse({'error': get_translated_message("INVALID_CODE", user_language)}, status=400))
        except Exception as e:
            return (JsonResponse({'error': get_translated_message("TWO_FACTOR_CODE_NOT_FOUND", user_language)}, status=404))

        access_token, access_exp = TokenService.generate_access_token(user.username)
        refresh_token, refresh_exp = TokenService.generate_refresh_token(user.username)

        token = {
            "username": user.username,
            "access_token": {"token": access_token, "expiration_date": access_exp},
            "refresh_token": {
                "token": refresh_token,
                "expiration_date": refresh_exp,
            },
        }
        user.refresh_token = refresh_token
        user.access_token = access_token
        user.save()

        twofactor.status = False
        twofactor.save()
        return JsonResponse({'message': token})


    # Test Edilcek -> Ihtiyaç Doğrultusuna göre düzenlencek
    @csrf_exempt
    def retry_verification_account(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "POST":
            return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED")}, status=405)
        try:
            data = JSONParser().parse(request)
            email = data.get('email')
            user = Users.objects.get(email=email)
            mail_token = MailTokens.objects.get(user=user, type="verify", status=True)
            if (TokenService.is_mail_token_expired(mail_token.expiration)):
                mail_token.status = False
                mail_token.save()

                new_token = str(uuid.uuid4())
                MailTokens.objects.create(
                    user = user,
                    token = new_token,
                    type="verify",
                    expiration= TokenService.create_expiration_date(60*24),
                )

                return JsonResponse({'error': get_translated_message("TOKEN_EXPIRED_EMAIL_SENT", user_language)}, status=400)

        except Exception as e:
            return JsonResponse({'error': get_translated_message("INVALID_VERIFICATION_TOKEN", user_language)}, status=404)


    @csrf_exempt
    def verifyAccount(request, verify_token):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        try:
            print(f"verfy_token : {verify_token}") 
            mail_token = MailTokens.objects.get(token=verify_token, type="verify", status=True)
            #Token check
            if timezone.now() > mail_token.expiration:
                mail_token.status = False
                mail_token.save()
                new_token = str(uuid.uuid4())
                MailTokens.objects.create(
                    user=mail_token.user,
                    token=new_token,
                    type="verify",
                    expiration=  timezone.now() + timedelta(minutes=(60 * 24)) # 1 gün
                )
                return (JsonResponse({'error': get_translated_message("MAIL_TOKEN_EXPIRED", user_language)}, status=400))
            mail_token.status = False
            mail_token.save()
            user = mail_token.user
            user.is_active = True
            user.save()
            return (JsonResponse({'message': get_translated_message("AUTH_SUCCESSFUL", user_language)}, status=200))
        except Exception as e:
            return JsonResponse({'error': get_translated_message("TOKEN_NOT_FOUND", user_language)}, status=403)

    # Kullanıcı Accsess Token Doğrulama
    @csrf_exempt
    def validate_token(request):
        user_language = request.headers.get("Accept-Language", "tr")
        if request.method != "GET":
            return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
        access_token = access_token_validate(request.headers.get("Authorization"))
        if access_token is None:
            return JsonResponse({'error': get_translated_message("INVALID_VALIDATE_TOKEN", user_language)}, status = 401)
        username = TokenService.validate_access_token(access_token)

        try:
            user = Users.objects.get(username=username)
        except:
            return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
        if user.access_token != access_token:
            return JsonResponse({'error': get_translated_message("INVALID_TOKEN_VALIDATE", user_language)},status=401)
        return JsonResponse({'valid': True, 'username' : username}, status = 200)
