from django.shortcuts import redirect
import requests
from django.db import models
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import UserSerializer, AdminSerializer
from .tools import username_check, image_to_url, image_intra_create
from rest_framework.parsers import JSONParser
from django.core.exceptions import ValidationError
from .translate_way import get_translated_message
from django.contrib.auth.hashers import make_password

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

@csrf_exempt
def user_create(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		username = request.POST.get('username')
		email = request.POST.get('email')
		password = request.POST.get('password')
		avatar = request.FILES.get('avatar', None)
		avatar_url = image_to_url(avatar, username)

		if username_check(username):
			return JsonResponse({'message': get_translated_message("USERNAME_EXISTS", user_language)}, status=400)
		user = User(
			first_name=first_name,
			last_name=last_name,
			username=username,
			email=email,
			password=password,
			avatar = avatar_url
		)
		user.save()
		serializer = UserSerializer(user)
		return JsonResponse(serializer.data, status=201)
	except Exception as e:
		return JsonResponse({"error": get_translated_message("USER_CREATION_ERROR", user_language)}, status=500)


#Not: Python'da not data kontrolü aşağıdaki durumları kontrol eder:
# Boş sözlük: {}
# Boş liste: []
# None değeri
# Boş string: ""
@csrf_exempt
def user_createJSON(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		# Gelen veriyi parse et
		data = JSONParser().parse(request)
		# Kullanıcıyı oluştur ve serialize et
		print(f"user data: {data.get('avatar')}")
		serializer = UserSerializer(data=data, context={'request': request})
		if serializer.is_valid():
			user = serializer.save()  # Yeni kullanıcı oluşturulur
			return JsonResponse(UserSerializer(user, context={'request': request}).data, status=201)
		else:
			return JsonResponse({"error": serializer.errors}, status=400)
	except Exception as e:
		return JsonResponse({"error": get_translated_message("USER_CREATION_ERROR", user_language)}, status=500)

def user_get(request, username):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "GET":
		return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
		if response.status_code != 200:
			return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)
		response_data = response.json()
		usernameToken = response_data.get('message').get('username')
		user = User.objects.get(username=usernameToken)  # Tek bir kullanıcı döner
		serializer = UserSerializer(user)  # Tekil kullanıcı için many=False (varsayılan)
		return JsonResponse({'message': serializer.data}, status=200)
	except User.DoesNotExist:
		return JsonResponse({"message": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
	except Exception as e:
		return JsonResponse({"error": get_translated_message("USER_FETCH_ERROR", user_language)}, status=500)

@csrf_exempt
def user_update(request, username):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		user = User.objects.get(username=username)
		data = JSONParser().parse(request)

		first_name = data.get('first_name', user.first_name)
		last_name = data.get('last_name', user.last_name)
		email = data.get('email', user.email)
		avatar = data.get('avatar', user.avatar)
		user.password = data.get('password', user.password)

		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.avatar = avatar
		user.save()

		return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)

	except User.DoesNotExist:
		return JsonResponse({"error": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
	except Exception as e:
		return JsonResponse({"error": get_translated_message("USER_UPDATE_ERROR", user_language), "str": str(e)}, status=500)

def search(request, query):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "GET":
		return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		if not query:
			return JsonResponse({"message": "Arama için 'query' parametresi gereklidir."}, status=400)
		users = User.objects.filter(
			models.Q(username__icontains=query) |
			models.Q(email__icontains=query) |
			models.Q(first_name__icontains=query) |
			models.Q(last_name__icontains=query)
		)
		serializer = UserSerializer(users, many=True)
		return JsonResponse({'message': serializer.data}, status=200)
	except Exception as e:
		return JsonResponse({"error": get_translated_message("USER_FETCH_ERROR", user_language)}, status=500) # değişcek (neden -burak)

def login(request):
	UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
	redirect_uri = "http://localhost:8000/api/callback/"  # Callback URL
	auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={UID}&redirect_uri={redirect_uri}&response_type=code"
	return redirect(auth_url)

def callback(request):
	user_language = request.headers.get("Accept-Language", "tr")
	code = request.GET.get('code')
	if not code:
		return JsonResponse({"error": get_translated_message("AUTH_CODE_NOT_FOUND_CALLBACK", user_language)}, status=400)
	print(code)
	UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
	SECRET = "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"
	redirect_uri = "http://localhost:8000/api/callback/"
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
	user_data = user_response.json()

	first_name = user_data.get('first_name')
	last_name = user_data.get('last_name')
	username = user_data.get('login')
	mail = user_data.get('email')
	avatar_url = user_data.get('image').get('link')
	if avatar_url:
		try:
			avatar_url = image_intra_create(avatar_url)
		except requests.exceptions.RequestException as e:
			JsonResponse({"error": get_translated_message("AVATAR_DOWNLOAD_ERROR", user_language)})
			avatar_url = None
	user = User.objects.create(
		first_name = first_name,
		last_name = last_name,
		username = username,
		password = "default",
		avatar = avatar_url,
		email = mail
	)
	user.save()
	serializer = UserSerializer(user)
	return JsonResponse(serializer.data, status=201)
