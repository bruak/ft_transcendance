from django.views import View
from .models import Users, MailTokens, TwofactorCodes
from .tokenService import TokenService
from .serializer import MailTokenSerializer, TwoFactoSerializer
from .translate_way import get_translated_message
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import os

class AdminRequest(View):
	# Admin'mi Diye Kontrol
	def validate_admin(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		authorization_header = request.headers.get("Authorization", "")
		if not authorization_header.startswith("Bearer "):
			return JsonResponse({'error': get_translated_message("MISSING_BEARER_TOKEN", user_language)}, status=400)
		access_token = authorization_header[7:]
		if access_token is None:
			return JsonResponse({'error': get_translated_message("INVALID_VALIDATE_TOKEN", user_language)}, status=401)

		status = TokenService.is_admin(access_token)
		data = {
			"valid": status,
		}

		if status:
			return JsonResponse({'message': data}, status=200)
		else:
			return JsonResponse({'message': data}, status=403)

	# Admin Fonksiyon Olucak (Admin Kontrolu Edilicek)
	@csrf_exempt
	def user_delete(request, username):
		user_language = request.headers.get("Accept-Language", "tr")

		if request.method != "DELETE":
			return JsonResponse({'error': get_translated_message("ONLY_DELETE_REQUESTS_ALLOWED", user_language)}, status=405)

		try:
			headers = {"Accept-Language": request.headers.get("Accept-Language", "tr"), "Authorization" : request.headers.get("Authorization", None)} 
			user = Users.objects.get(username=username)
			
			userDB_response = requests.get(f"http://project-users-1:8000/adminuser/{user.username}/", headers=headers)
			avatar_path = f"/app/{userDB_response.json().get('message').get('avatar')}"

			# Kullanıcının avatarını ve diğer verilerini silme işlemi
			if avatar_path != '/media/avatars/default.jpg' and avatar_path:
				if os.path.exists(avatar_path):
					os.remove(avatar_path)

			user_response = requests.delete(f"http://project-users-1:8000/delete/{user.username}/", headers=request.headers)

			if user_response.status_code != 200:
				return JsonResponse({'error': get_translated_message("USER_DELETE_ERROR", user_language)}, status=500)
			user.delete()
			return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)
		except Users.DoesNotExist:
			return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
		except Exception as e:
			return JsonResponse({'error': get_translated_message("REQUEST_FAILED", user_language), 'exception': str(e)}, status=500)

	# Kullanıcı Hakkında Verilcek Bilgiler (Admin İçin) (Admin Kontrolu Edilicek)
	def listUsers(request, username):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			user = Users.objects.get(username=username)
			print(user.is_active)
			data = {
				"is_active": user.is_active,
				"status" : user.status,
			}
			return JsonResponse({'message': data}, status=200)  # Başarılı durum
		except Users.DoesNotExist:
			return JsonResponse({"error": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
		except Exception as e:
			return JsonResponse({"error": get_translated_message("USER_FETCH_ERROR", user_language)}, status=500)

	# Tüm Mail Token List (Admin İçin) (Admin Kontrolu Edilicek) 
	def MailTokenlist(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			mail_tokens = MailTokens.objects.all()
			serializer = MailTokenSerializer(mail_tokens, many=True)
			return JsonResponse({'message': serializer.data}, status=200)
			
		except Exception as e:
			return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", user_language)}, status=500)

	# Tüm TwoFactor List (Admin İçin) (Admin Kontrolu Edilicek)
	def twoFactorList(request):
		user_language = request.headers.get("Accept-Language", "tr")
			
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			twofactor = TwofactorCodes.objects.all()
			serializer = TwoFactoSerializer(twofactor, many=True)
			return JsonResponse({'message': serializer.data}, status=200)
			
		except Exception as e:
			# Hata durumunda hata mesajı döndür
			return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", user_language)}, status=500)
