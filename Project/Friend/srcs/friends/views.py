from django.db import models
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .models import Friends
from rest_framework import status
import requests
from .serializers import FriendsSerializer
from .translate_way import get_translated_message
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist

class FriendRequestView(View):
	@csrf_exempt
	def send_friend_request(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		
		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)
			
			response_data = response.json()
			username = response_data.get('message').get('username')

			data = JSONParser().parse(request)
			friendname = data.get('friend') 

			user_response = requests.get(f"http://auth:8000/userexists/{username}/", headers=request.headers)
			friend_response = requests.get(f"http://auth:8000/userexists/{friendname}/", headers=request.headers)

			if user_response.status_code != 200 or friend_response.status_code != 200:
				return JsonResponse({"error": get_translated_message("NOT_FOUND_USER", user_language)}, status=status.HTTP_404_NOT_FOUND)

			if username == friendname:
				return JsonResponse({"message": get_translated_message("SELF_REQUEST_NOT_ALLOWED", user_language)}, status=400)

			if Friends.objects.filter(
				models.Q(username=username, friendname=friendname, status="accepted") |
				models.Q(username=friendname, friendname=username, status="accepted")
			).exists():
				return JsonResponse({"error": get_translated_message("FRIEND_REQUEST_EXISTS_OR_FRIENDS", user_language)}, status=status.HTTP_400_BAD_REQUEST)

			existing_request = Friends.objects.filter(
				(models.Q(username=username, friendname=friendname) |
				models.Q(username=friendname, friendname=username))
			).first()

			if existing_request:
				if existing_request.status == "pending":
					return JsonResponse({"error": get_translated_message("SUCCESSFUL", user_language)}, status=200)
				elif existing_request.status == "rejected":
					existing_request.status = "pending"
					existing_request.save()
					return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_RECREATED", user_language)}, status=201)
				elif existing_request.status == "removed":
					existing_request.status = "pending"
					existing_request.save()
					return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_RECREATED", user_language)}, status=201)

			serializer = FriendsSerializer(data={"username": username, "friendname": friendname, "status": "pending"})
			if serializer.is_valid():
				serializer.save()
				return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_SENT", user_language)}, status=201)
			return JsonResponse({"error": "Unexpected flow reached"}, status=500)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
		
		finally:
			try:
				requests.post('http://notification:8000/create/', json={"message": "friend_request"})
			except Exception as e:
				pass

	def list_friend_requests(request, username):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)

		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)

			response_data = response.json()
			usernameToken = response_data.get('message').get('username')
			data = Friends.objects.filter(friendname=usernameToken, status="pending")
			serializer = FriendsSerializer(data, many=True)
			return JsonResponse({'message': serializer.data}, safe=False, status=status.HTTP_200_OK)

		except Exception as e:
			return JsonResponse({"error": get_translated_message("USER_FETCH_ERROR", user_language)}, status=500)

	@csrf_exempt
	def accept_friend_request(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)

			response_data = response.json()
			username = response_data.get('message').get('username')
			data = JSONParser().parse(request)
			friendname = data.get("friendname")

			friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
			friend_request.status = "accepted"
			friend_request.save()
			return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_ACCEPTED", user_language)}, status=status.HTTP_200_OK)

		except Friends.DoesNotExist:
			return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_NOT_FOUND", user_language)}, status=status.HTTP_404_NOT_FOUND)

		finally:
			try:
				requests.post('http://notification:8000/create/', json={"message": "friend_request"})
			except Exception as e:
				pass

	def friends(request, username):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", language)}, status=405)
		
		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", language)},  status=response.status_code)
			response_data = response.json()
			usernameToken = response_data.get('message').get('username')
			response = Friends.objects.filter(
				models.Q(friendname=usernameToken, status="accepted") | models.Q(username=usernameToken, status="accepted")
			)
			modified_data = []
			online_users = requests.get('http://notification:8000/online-users/')
			online_users = online_users.json().get('message')
			if not response.exists():
				return JsonResponse({'message': modified_data}, status=200)

			for friend in response:
				if friend.friendname == usernameToken:
					modified_data.append({
						"username": friend.friendname,
						"friendname": friend.username,
						"online": friend.username in online_users
					})
				else:
					modified_data.append({
						"username": friend.username,
						"friendname": friend.friendname,
						"online": friend.username in online_users
					})

			return JsonResponse({'message': modified_data}, safe=False, status=status.HTTP_200_OK)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	@csrf_exempt
	def rejected_friend_request(request): 
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		
		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)
			
			response_data = response.json()
			username = response_data.get('message').get('username')

			data = JSONParser().parse(request)
			friendname = data.get('friendname')
			friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
			friend_request.status = "rejected"
			friend_request.save()
			return JsonResponse({"message": get_translated_message("SUCCESSFUL", user_language)}, status=200)

		except Friends.DoesNotExist:
			return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_NOT_FOUND", user_language)}, status=status.HTTP_404_NOT_FOUND)

	@csrf_exempt
	def remove_friend(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)

		try:
			response = requests.get('http://project-auth-1:8000/get-username/',  headers=request.headers)
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("ACCESS_TOKEN_USER_MISMATCH", user_language)},  status=response.status_code)
			response_data = response.json()
			username = response_data.get('message').get('username')

			data = JSONParser().parse(request)
			friendname = data.get("friendname")
			if not username or not friendname:
				return JsonResponse({"error": get_translated_message("MISSING_PARAMETERS", user_language)}, status=400)
			try:
				friendship = Friends.objects.get(
					Q(username=username, friendname=friendname) |
					Q(username=friendname, friendname=username)
				)
			except ObjectDoesNotExist:
				return JsonResponse({"error": get_translated_message("FRIENDSHIP_NOT_FOUND", user_language)}, status=404)

			if friendship.status == "accepted":
				friendship.delete()
				return JsonResponse({"message": get_translated_message("FRIEND_REMOVED_SUCCESS", user_language)}, status=200)
			else:
				return JsonResponse({"error": get_translated_message("CANNOT_REMOVE_FRIEND", user_language)}, status=400)

		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
		finally:
			try:
				requests.post('http://notification:8000/create/', json={"message": "remove_friend"})
			except Exception as e:
				pass
