from django.shortcuts import redirect
from django.views import View
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


class UserRequest(View):
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

	# (Accses Token)
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

	# auth'tan veri geliyor o yüzden username kaldırmıyorz
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

