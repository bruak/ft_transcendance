from django.shortcuts import redirect
from .models import Users, MailTokens, TwofactorCodes
from .tokenService import TokenService
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from django.utils.crypto import get_random_string
import uuid
import requests
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .tools import image_to_url, generate_random_code, image_intra_create, access_token_validate, username_check
from .translate_way import get_translated_message

@csrf_exempt
def singin(request):
	if request.method == "POST":
		# return get_translated_message_test() # its for test, u can remove this line

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
			if (password != user.password):
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
		# creating new user here
		user = Users.objects.create(
			username=username,
			email=email,
			password=password,
			is_active = False,
		)

		token = str(uuid.uuid4())
		MailTokens.objects.create(
				user=user,
				token=token,
				type="verify",
				expiration=  timezone.now() + timedelta(minutes=(60 * 24))
		)

		headers = {"Accept-Language": "application/json"}
		user_data = {
			"username": username,
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			"avatar": avatar_url,
		}

		mail_url = f"https://localhost:8080/api/auth/verify-account/{token}/"
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
			twofactor.status = False;
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

#Kullanıcı Mail Doğrulama
@csrf_exempt
def verifyAccount(request, verify_token):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "GET":
		return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		print(f"verfy_token : {verify_token}") # what s for @ali????
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

		user = mail_token.user
		user.is_active = True
		user.save()
		return (JsonResponse({'message': get_translated_message("AUTH_SUCCESSFUL", user_language)}, status=200))
	except Exception as e:
		return JsonResponse({'error': get_translated_message("TOKEN_NOT_FOUND", user_language)}, status=403)

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
	return JsonResponse({'valid': True}, status = 200)

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

# İntra Login
def intra_login(request):
	UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
	redirect_uri = "https://localhost:8080/api/auth/callback/"  # Callback URL
	auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={UID}&redirect_uri={redirect_uri}&response_type=code"
	return JsonResponse({'url': auth_url}, status=200)

#İntra Callback
def callback(request, code):
	user_language = request.headers.get("Accept-Language", "tr")
	if not code:
		return JsonResponse({"error": get_translated_message("AUTH_CODE_NOT_FOUND_CALLBACK", user_language)}, status=400)

	UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
	SECRET = "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"
	redirect_uri = "https://localhost:8080/api/auth/callback/"  # Callback URL
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

	if username_check(username):
		return JsonResponse({'error': get_translated_message("USERNAME_EXISTS", user_language)}, status=409)
	if Users.objects.filter(email=data.get('email')).exists():
		return JsonResponse({'error': get_translated_message("EMAIL_EXISTS", user_language)}, status=409)

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
	return(JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=201))

