from django.shortcuts import redirect
import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Friends
from .serializers import UserSerializer
from .tools import username_check, image_to_url, image_intra_create
from rest_framework.parsers import JSONParser, MultiPartParser , FormParser
from rest_framework.decorators import parser_classes
import json
from django.core.exceptions import ValidationError
import os

# user list
@csrf_exempt
def user_list(request):
	if request.method != "GET":
		return JsonResponse({"error": "Only GET method is allowed."}, status=405)
	try:
		obj = User.objects.all()
		serializer = UserSerializer(obj, many=True)
		return JsonResponse(serializer.data, safe=False, status=200)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

# user create
@csrf_exempt
def user_create(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		username = request.POST.get('username')
		email = request.POST.get('email')
		password = request.POST.get('password')
		avatar = request.FILES.get('avatar', None)
		avatar_url = image_to_url(avatar, username)

		if username_check(username):
			return JsonResponse({'message': "bu username var"})
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
		return JsonResponse({"error": str(e)}, status=500)


#Not: Python'da not data kontrolü aşağıdaki durumları kontrol eder:
# Boş sözlük: {}
# Boş liste: []
# None değeri
# Boş string: ""
@csrf_exempt
def user_createJSON(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		# Gelen veriyi parse et
		data = JSONParser().parse(request)
		# Kullanıcıyı oluştur ve serialize et
		serializer = UserSerializer(data=data)
		if serializer.is_valid():
			user = serializer.save()  # Yeni kullanıcı oluşturulur
			return JsonResponse(UserSerializer(user, context={'request': request}).data, status=201)
		else:
			return JsonResponse({"error": serializer.errors}, status=400)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

def user_get(request, username):
	if request.method != "GET":
		return JsonResponse({'message': "Get değil"})
	try:
		user = User.objects.get(username=username)  # Tek bir kullanıcı döner
		serializer = UserSerializer(user)  # Tekil kullanıcı için many=False (varsayılan)
		return JsonResponse(serializer.data, status=200)
	except User.DoesNotExist:
		return JsonResponse({"message": "User not found"}, status=404)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def user_update(request, username):
	if request.method != "POST":
			return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		user = User.objects.get(username=username)

		data = request.POST
		files = request.FILES.get('avatar', None)
		if files:
			avatar = image_to_url(files, data.get('username', user.username))

		user.first_name = data.get('first_name', user.first_name)
		user.last_name = data.get('last_name', user.last_name)
		user.username = data.get('username', user.username)
		user.email = data.get('email', user.email)
		user.password = data.get('password', user.password)
		if files:
			if user.avatar and os.path.exists(f"/app{user.avatar}"):
				os.remove(f"/app{user.avatar}")
			user.avatar = avatar
		user.save()
		serializer = UserSerializer(user)
		return JsonResponse(serializer.data, status=200)
	except User.DoesNotExist:
		return JsonResponse({"error": "User not found"}, status=404)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

def login(request):
	UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
	redirect_uri = "http://localhost:8000/api/callback/"  # Callback URL
	auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={UID}&redirect_uri={redirect_uri}&response_type=code"
	return redirect(auth_url)


def callback(request):
	code = request.GET.get('code')
	if not code:
		return JsonResponse({"error": "Authorization code not found"}, status=400)

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
		return JsonResponse({"error": "Unable to fetch access token"}, status=response.status_code)
	token = response.json()
	access_token = token.get('access_token')
	if not access_token:
		return JsonResponse({"error": "Access token not found"}, status=400)
	# Kullanıcı bilgilerini çekmek için token'ı kullanın
	user_info_url = "https://api.intra.42.fr/v2/me"
	headers = {
		'Authorization': f'Bearer {access_token}'
	}
	user_response = requests.get(user_info_url, headers=headers)
	if user_response.status_code != 200:
		return JsonResponse({"error": "Unable to fetch user data"}, status=user_response.status_code)
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
			JsonResponse({'Avatar indirme hatası:': e})
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




