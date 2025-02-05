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
		return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		friendname = data.get('friend')

		user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")
		friend_response = requests.get(f"http://project-users-1:8000/getuser/{friendname}/")

		if user_response.status_code != 200 or friend_response.status_code != 200:
			return JsonResponse({"error": get_translated_message("NOT_FOUND_USER", user_language)}, status.HTTP_404_NOT_FOUND)

		if username == friendname:
			return JsonResponse({"message": get_translated_message("SELF_REQUEST_NOT_ALLOWED", user_language)}, status = 400)

		if Friends.objects.filter(
		models.Q(username=username, friendname=friendname) |
		models.Q(username=friendname, friendname=username)).exists():
			return JsonResponse({"error": get_translated_message("FRIEND_REQUEST_EXISTS_OR_FRIENDS", user_language)}, status=status.HTTP_400_BAD_REQUEST)
		serializer = FriendsSerializer(data={"username": username, "friendname": friendname, "status": "pending"})
		if serializer.is_valid():
			serializer.save()
			return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_SENT", user_language)}, status=status.HTTP_201_CREATED)
		return JsonResponse({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
def list_friend_requests(request, username):
	user_language = request.headers.get("Accept-Language", "tr")
	requests = Friends.objects.filter(friendname=username, status="pending")
	if not requests.exists():
		return JsonResponse({"error": get_translated_message("NO_PENDING_FRIEND_REQUESTS", user_language)}, status=status.HTTP_404_NOT_FOUND)
	serializer = FriendsSerializer(requests, many=True)
	return JsonResponse({'message': serializer.data}, safe=False, status=status.HTTP_200_OK)

@csrf_exempt
def rejected_friend_request(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		data = JsonResponse().parse(request)
		username = data.get('username')
		friendname = data.get('friendname')
		friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
		friend_request.status = "rejected"
		friend_request.save()
	except Friends.DoesNotExist:
		return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_NOT_FOUND", user_language)}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@csrf_exempt
def accept_friend_request(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method != "POST":
		return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get("username")
		friendname = data.get("friendname")

		friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
		friend_request.status = "accepted"
		friend_request.save()
		return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_ACCEPTED", user_language)}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": get_translated_message("FRIEND_REQUEST_NOT_FOUND", user_language)}, status=status.HTTP_404_NOT_FOUND)

# Dil Ekle Ve Test Et
@api_view(["GET"])
def friends(request, username):
	try:
		language = request.headers.get("Accept-Language", "tr")
		# accepted arkadaşları sorguluyoruz
		response = Friends.objects.filter(
			models.Q(friendname=username, status="accepted") | models.Q(username=username, status="accepted")
		)

		if not response.exists():
			return JsonResponse({"message": get_translated_message("NO_FRIENDS_FOUND", language)}, status=status.HTTP_404_NOT_FOUND)

		modified_data = []

		for friend in response:
			if friend.friendname == username:
				modified_data.append({
					"username": friend.friendname,
					"friendname": friend.username,
				})
			else:
				modified_data.append({
					"username": friend.username,
					"friendname": friend.friendname,
				})

		return JsonResponse({'message': modified_data}, safe=False, status=status.HTTP_200_OK)
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
		return JsonResponse({"message": get_translated_message("FRIEND_BLOCKED", user_language)}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": get_translated_message("FRIEND_RELATIONSHIP_NOT_FOUND", user_language)}, status=status.HTTP_404_NOT_FOUND)
