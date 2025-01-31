from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .models import Friends
from rest_framework import status
import requests
from .serializers import FriendsSerializer
from rest_framework.decorators import api_view



def get_translated_message(message_key, user_language):

	if user_language is None or user_language == "" or user_language not in ["tr", "en", "fr"]:
		user_language = "tr"  # Default language is Turkish

	headers = {"Accept-Language": user_language}
	try:
		response = requests.get("http://project-translation-1:8000/get_translation/", headers=headers)
		print(response.status_code)
		if response.status_code == 200:
			translations = response.json()
			return translations.get(message_key, message_key)  # Çeviri yoksa orijinal mesajı dön
	except Exception as e:
		print(f"Translation service error [LOG]: {e}")  # Log için
	return message_key + " NOT WORKING (THIS IS FOR TEST)" # Hata olursa orijinal mesajı dön


@csrf_exempt
@api_view(["POST"])
def send_friend_request(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)

	try:
		user_language = request.headers.get("Accept-Language", "tr") #http isteğinden gelen header eğer yoksa default olarak tr olur.
		data = JSONParser().parse(request)
		username = data.get('username')
		friendname = data.get('friend')

		user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")
		friend_response = requests.get(f"http://project-users-1:8000/getuser/{friendname}/")

		if user_response.status_code != 200 or friend_response.status_code != 200:
			return JsonResponse({"message": get_translated_message("Not Found User")}, status.HTTP_404_NOT_FOUND)

		if username == friendname:
			return JsonResponse({"message": get_translated_message("You cannot send a request to your own account.")}, status = 400)

		if Friends.objects.filter(
		models.Q(username=username, friendname=friendname) |
		models.Q(username=friendname, friendname=username)).exists():
			return JsonResponse({"message": "Friend request already exists or you are already friends."}, status=status.HTTP_400_BAD_REQUEST)
		serializer = FriendsSerializer(data={"username": username, "friendname": friendname, "status": "pending"})

		if serializer.is_valid():
			serializer.save()
			return JsonResponse({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)
		return JsonResponse({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def list_friend_requests(request, username):
	requests = Friends.objects.filter(friendname=username, status="pending")
	serializer = FriendsSerializer(requests, many=True)
	return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

@api_view(["POST"])
@csrf_exempt
def accept_friend_request(request):
	try:
		data = JSONParser().parse(request)
		username = data.get("username")
		friendname = data.get("friendname")

		friend_request = Friends.objects.get(username=friendname, friendname=username, status="pending")
		friend_request.status = "accepted"
		friend_request.save()
		return JsonResponse({"message": "Friend request accepted."}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def block_friend(request):
	data = request.data
	username = data.get("username")
	friendname = data.get("friendname")

	try:
		friend_request = Friends.objects.get(username=username, friendname=friendname)
		friend_request.status = "blocked"
		friend_request.save()
		return JsonResponse({"message": "Friend blocked."}, status=status.HTTP_200_OK)
	except Friends.DoesNotExist:
		return JsonResponse({"message": "Friend relationship not found."}, status=status.HTTP_404_NOT_FOUND)
