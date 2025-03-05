from django.http import JsonResponse
from django.views import View
from .translate_way import get_translated_message
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .models import Friends
from rest_framework import status

class FriendRequestAdminView(View): 

	@csrf_exempt
	def friend_update(request):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", language)}, status=405)

		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			friendname = data.get('friendname')
			status = data.get('status')

			if not username or not friendname or not status:
				return JsonResponse({"error": get_translated_message("FRIEND_REQUEST_SENT", language)}, status=400 )
			status = status.lower()
			friend = Friends.objects.get(username=username, friendname=friendname)
			if friend.status == status:
				return JsonResponse({'message': get_translated_message("SUCCESSFUL", language)}, status=200)
			friend.status = status
			friend.save()
			return JsonResponse({'message': get_translated_message("SUCCESSFUL", language)}, status=200)

		except Friends.DoesNotExist:
				return JsonResponse({"message": None}, status=404)	
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	@csrf_exempt
	def friend_delete(request, username, friendname):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "DELETE":
			return JsonResponse({"error": get_translated_message("ONLY_DELETE_REQUESTS_ALLOWED", language)}, status=405)

		try:
			response = Friends.objects.get(username=username, friendname=friendname)
			response.delete()
			return JsonResponse({'message': get_translated_message("SUCCESSFUL", language)}, status=200)

		except Friends.DoesNotExist:
				return JsonResponse({"message": None}, status=200)	
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def friend_info(request, username, friendname):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", language)}, status=405)

		try:
			response = Friends.objects.get(username=username, friendname=friendname)
			modified_data = {
				"username": response.username,
				"friendname": response.friendname,
				"status": response.status,
				"created": response.created_at,
				"update" : response.updated_at,
			}
			return JsonResponse({"message": modified_data}, status=200)

		except Friends.DoesNotExist:
				return JsonResponse({"message": None}, status=200)	
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def friend_list(request):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", language)}, status=405)

		try:
			response = Friends.objects.all()
			if not response:
				return JsonResponse({'message': []}, safe=False, status=200)
			modified_data = []
			for friend in response:
				modified_data.append({
					"username": friend.username,
					"friendname": friend.friendname,
					"status": friend.status,
				})
			return JsonResponse({'message': modified_data}, safe=False, status=status.HTTP_200_OK)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

