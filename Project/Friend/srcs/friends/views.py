from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .models import Friends
from rest_framework import status
import requests
from .serializers import FriendsSerializer
from rest_framework.decorators import api_view
from .translate_way import get_translated_message

@csrf_exempt
@api_view(["POST"])
def send_friend_request(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({"error": get_translated_message("Only POST requests are allowed.", user_language)}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		friendname = data.get('friend')

		user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")
		friend_response = requests.get(f"http://project-users-1:8000/getuser/{friendname}/")

		if user_response.status_code != 200 or friend_response.status_code != 200:
			return JsonResponse({"error": get_translated_message("Not Found User", user_language)}, status.HTTP_404_NOT_FOUND)

		if username == friendname:
			return JsonResponse({"message": get_translated_message("You cannot send a request to your own account.", user_language)}, status = 400)

		if Friends.objects.filter(
		models.Q(username=username, friendname=friendname) |
		models.Q(username=friendname, friendname=username)).exists():
			return JsonResponse({"error": get_translated_message("Friend request already exists or you are already friends.", user_language)}, status=status.HTTP_400_BAD_REQUEST)
		serializer = FriendsSerializer(data={"username": username, "friendname": friendname, "status": "pending"})
		if serializer.is_valid():
			serializer.save()
			return JsonResponse({"message": get_translated_message("Friend request sent successfully.", user_language)}, status=status.HTTP_201_CREATED)
		return JsonResponse({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
def list_friend_requests(request, username):
	user_language = request.headers.get("Accept-Language", "tr")
	requests = Friends.objects.filter(friendname=username, status="pending")
	if not requests.exists():
		return JsonResponse({"error": get_translated_message("No pending friend requests found.", user_language)}, status=status.HTTP_404_NOT_FOUND)
	serializer = FriendsSerializer(requests, many=True)
	return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

@api_view(["POST"])
@csrf_exempt
def accept_friend_request(request):
	user_language = request.headers.get("Accept-Language", "tr")
	try:
		data = JSONParser().parse(request)
		username = data.get("username")
		friendname = data.get("friendname")

		friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
		friend_request.status = "accepted"
		friend_request.save()
		return JsonResponse({"message": get_translated_message("Friend request accepted.", user_language)}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": get_translated_message("Friend request not found.", user_language)}, status=status.HTTP_404_NOT_FOUND)

# Dil Ekle Ve Test Et
@api_view(["GET"])
def friends(request, username):
	try:
		language = request.headers.get("Accept-Language", "tr")
		response = Friends.objects.filter(
			models.Q (friendname=username, status="accepted") | models.Q(username=username, status="accepted"))
		if not response.exists():
				return JsonResponse({"message": get_translated_message("No friends found.", language)}, status=status.HTTP_404_NOT_FOUND)
		serializer = FriendsSerializer(response, many=True)
		return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def block_friend(request):
	user_language = request.headers.get("Accept-Language", "tr")
	data = request.data
	username = data.get("username")
	friendname = data.get("friendname")

	try:
		friend_request = Friends.objects.get(username=username, friendname=friendname)
		friend_request.status = "blocked"
		friend_request.save()
		return JsonResponse({"message": get_translated_message("Friend blocked.", user_language)}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": get_translated_message("Friend relationship not found.", user_language)}, status=status.HTTP_404_NOT_FOUND)
