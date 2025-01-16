from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.parsers import JSONParser
from .models import Friends
import requests


@csrf_exempt
def add_friend(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)

    try:
        data = JSONParser().parse(request)
        username = data.get('username')
        friendname = data.get('friend')
        # Kullanıcıyı API'den çekiyoruz
        if not username or not friendname:
            return JsonResponse({"error": "Both 'username' and 'friend' fields are required."}, status=400)

        # API çağrıları
        base_url = "http://localhost:8000/api/getuser/"
        headers = {
            "Content-Type": "application/json"
        }

        user_response = requests.get(f"{base_url}{username}", headers=headers)
        friend_response = requests.get(f"{base_url}{friendname}", headers=headers)

        # Yanıtların kontrolü
        if user_response.status_code != 200:
            return JsonResponse({"error": f"User '{username}' not found."}, status=404)
        if friend_response.status_code != 200:
            return JsonResponse({"error": f"Friend '{friendname}' not found."}, status=404)

        if user_response.status_code != 200 or friend_response.status_code != 200:
            return JsonResponse({"message": "Böyle bir kullanıcı yok."})

        user_data = user_response.json()
        friend_data = friend_response.json()

        user_id = user_data.get("id")
        friend_id = friend_data.get("id")

        if user_id == friend_id:
            return JsonResponse({"message": "Kendine istek gönderemezsin."})

        if Friends.objects.filter(user_id=user_id, friend_id=friend_id).exists():
            return JsonResponse({"message": "Zaten arkadaşsınız."})

        friend_model = Friends.objects.create(user_id=user_id, friend_id=friend_id)
        friend_model2 = Friends.objects.create(user_id=friend_id, friend_id=user_id)

        if friend_model and friend_model2:
            return JsonResponse({'message': "Arkadaş ekleme başarılı."})

        if friend_model:
            friend_model.delete()
        if friend_model2:
            friend_model2.delete()

        return JsonResponse({'message': "Kullanıcı ekleme başarısız."})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
