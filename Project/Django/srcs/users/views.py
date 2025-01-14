from django.shortcuts import render
from .models import User
from .serializers import UserSerializer
from rest_framework import generics

import requests
from requests.auth import HTTPBasicAuth
from django.views import View
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt

# user list
def user_list(request):
	if request.method != "GET":
		return JsonResponse({"error": "Only GET method is allowed."}, status=405)
	try:
		obj = User.objects.all()
		serializer = UserSerializer(obj, many=True, context={"request": request})
		return JsonResponse(serializer.data, safe=False)
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
		user = User(
			first_name=first_name,
			last_name=last_name,
			username=username,
			email=email,
			password=password,
			avatar=avatar
		)
		user.save()
		serializer = UserSerializer(user)
		return JsonResponse(serializer.data, status=201)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

# json response
@csrf_exempt
def user_update(request, pk):
	if request.method == "PUT":
		try:
			user = User.objects.get(pk=pk)
			data = JSONParser().parse(request)
			serializer = UserSerializer(user, data=data)
			if (serializer.is_valid()):
				serializer.save()
				return (JsonResponse(serializer.data, status=200))
			return JsonResponse(serializer.errors, status=400)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	elif request.method == "GET" :
		try:
			user = User.objects.get(pk=pk)
			serializer = UserSerializer(user)
			return JsonResponse(serializer.data)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	elif request.method == "DELETE":
		try:
			user = User.objects.get(pk=pk)
			user.delete()
			return (HttpResponse("user deleted, user name is " + user.username))
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)


class GetCursusUsersView(View):
	def get(self, request, *args, **kwargs):
		# Uygulamanızın UID ve SECRET bilgilerini buraya girin
		UID = "u-s4t2ud-d6fc5ab81237161a534008480af5e5e57c39deef93e97fd49b9af9e1fa666caf"
		SECRET = "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"

		# Token almak için gerekli URL
		token_url = "https://api.intra.42.fr/oauth/token"
		data = {
			'grant_type': 'client_credentials',
			'client_id': UID,
			'client_secret': SECRET
		}

		# POST isteğiyle token alıyoruz
		response = requests.post(token_url, data=data)

		# JSON formatında dönen yanıtı alıyoruz
		if response.status_code != 200:
			return JsonResponse({"error": "Unable to get token"}, status=400)

		##if response.headers['Content-Type'] != 'application/json':
		##	return JsonResponse({"message": "amk"})
		token = response.json()
		access_token = token.get('access_token')
		JsonResponse({"message": access_token})
		if not access_token:
			return JsonResponse({"error": "Access token not found"}, status=400)
		# Erişim token'ını başlıkta kullanarak isteği yapıyoruz
		headers = {
			'Authorization': f'Bearer {access_token}'
		}
		# 42 Cursus'undaki kullanıcıları almak için URL
		users_url = "https://api.intra.42.fr/v2/users/albozkur"
		users_response = requests.get(users_url, headers=headers)

		# Kullanıcı verilerini alıyoruz
		if users_response.status_code != 200:
			return JsonResponse({"error": "Unable to fetch users"}, status=400)

		users_data = users_response.json()
		return JsonResponse({'user_count': len(users_data), 'users': users_data})



class UserViewSet(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class UserDeleteView(generics.RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
