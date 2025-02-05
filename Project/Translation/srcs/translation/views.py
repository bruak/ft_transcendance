from django.shortcuts import render
from django.utils.translation import activate, gettext as _
from django.http import JsonResponse
from .message import MESSAGES

def translation(request, key):
	user_language = request.headers.get("Accept-Language", "tr")
	activate(user_language)
	try:
		#messages = {key: _(message) for key, message in MESSAGES.items()}
		if key in MESSAGES:
			message = _(MESSAGES[key])  # İlgili key'in çevirisini al
			return JsonResponse({"message": message}, status=200)  # Sadece mesajı döndür
		else:
			return JsonResponse({"error": "Key not found"}, status=404)
	except Exception as e:
		return JsonResponse({"error": "Internal Server Error"}, status=500)
