from django.http import JsonResponse
from django.views import View
from .models import Friends
from rest_framework import status

class FriendRequestAdminView(View): 
	# (Admin Arkadaşlık Listesi List) (Admin) -> Düzeltilcek
	def friend_list(request):
		language = request.headers.get("Accept-Language", "tr")
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

