from django.shortcuts import render
from .models import Users, MailTokens, TwofactorCodes
from .tokenService import TokenService
from .tools import generate_random_code
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.utils.crypto import get_random_string
import uuid
import requests
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .tools import image_to_url

#Test Etmen lazım
@csrf_exempt
def signup(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		username = request.POST.get('username')
		email = request.POST.get('email')
		password = request.POST.get('password')
		avatar_file = request.FILES.get('avatar', None)
		avatar_url = image_to_url(avatar_file, username)
		#if username_check(username):
		#	return JsonResponse({'message': "bu username var"})
		if Users.objects.filter(email=email).exists():
			return JsonResponse({'message': "Mail Zaten Var"})

		user = Users.objects.create(
			username=username,
			email=email,
			password=password,
			is_active = False,
			#avatar = avatar_url
		)

		token = str(uuid.uuid4())

		MailTokens.objects.create(
				user=user,
				token=token,
				type="verify",
				expiration=  timezone.now() + timedelta(minutes=(60 * 24)) # 1 gün
		)

		headers = {"Accept-Language": "application/json"}
		user_data = {
			"username": username,
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			"avatar": avatar_url,
		}

		mail_url = f"http://127.0.0.1:8003/verify-account/{token}"
		mail_data = {
			"token": mail_url,
			"username" : username,
			"email": email,
		}
		# verify-account/
		mail_response = requests.post(f"http://project-mail-1:8000/api/verify/", json=mail_data, headers=headers)
		if (mail_response.status_code != 200):
			return JsonResponse({'message': "Mail Gönderilmedi"})

		user_response = requests.post(f"http://project-users-1:8000/api/postjson/", json=user_data, headers=headers)
		if user_response.status_code != 201:
			user.delete()
			return JsonResponse({'message': "User Service Error"})
		return JsonResponse({'message': "işlem başarılı"})
	except Exception as e:
		return JsonResponse({'message': "Sigup Error", 'error': str(e)})

@csrf_exempt
def signin(request):
	if request.method == "POST":
		data = JSONParser().parse(request)
		signin = data.get("sign")
		password = data.get("password")
		try:
			user = (
				Users.objects.get(email=signin)
				if "@" in signin
				else Users.objects.get(username=signin)
			)
			if (password != user.password):
				return (JsonResponse({'message': "User Password Error"}))
			code = generate_random_code()
			TwofactorCodes.objects.create(
				user = user,
				code = code,
				expiration = TokenService.create_expiration_date(15)
			)

			mail_data = {
				"email": user.email,
				"code": code
			}
			headers = {"Accept-Language": "application/json"}
			mail_response = requests.post(f"http://project-mail-1:8000/api/2fa/", json=mail_data, headers=headers)
			if (mail_response.status_code != 200):
				return JsonResponse({"message": "Mail Gönderilemedi"})
			return (JsonResponse({"message": "Başarılı"}))
		except Exception as e:
			return (JsonResponse({'message': "Not Found User"}))

@csrf_exempt
def twofactor(request):
	if request.method != "POST":
		return JsonResponse({'error': "Sadece POST isteklerine izin verilir."}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		code = data.get('code')
		user = Users.objects.get(username=username)
		if not user.is_active:
			return (JsonResponse({"message": "Hesap Doğrulanma Yapılmadı"}, status=400))
		twofactor = TwofactorCodes.objects.get(user=user, code=code, status=True)
		if TokenService.is_mail_token_expired(twofactor.expiration):
			twofactor.status = False;
			twofactor.save()
			return (JsonResponse({'message': "Invalid code"}))
		# Burası hem user hemde towfocter için 2 try ctach'e alınabilir
	except Exception as e:
		return (JsonResponse({'message': "Not  Found"}))

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

@csrf_exempt
def verifyAccount(request, verify_token):
	if request.method != "POST":
		return JsonResponse({'error': "Sadece POST isteklerine izin verilir."}, status=405)
	mail_token = MailTokens.objects.get(token=verify_token, type="verify", status=True)
	#Böyle bir token varmı diye bir kontrol ypa
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
		return (JsonResponse({'message': "Mailin Süresi Doldu enayi, yeni mail gönderdik kontrol et"}))

	user = mail_token.user
	user.is_active = True
	user.save()
	return (JsonResponse({'message': "Doğrulama Yapıldı"}))
