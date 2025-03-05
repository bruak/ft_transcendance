from django.views import View
from .models import Users, MailTokens, TwofactorCodes
from .tokenService import TokenService
from .serializer import MailTokenSerializer, TwoFactoSerializer
from .translate_way import get_translated_message
from .tools import image_to_url, is_image
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import os
from datetime import timedelta
from django.utils import timezone
import uuid
from .translate_way import get_translated_message

class AdminRequest(View):
	@csrf_exempt
	def admin_user_update(request, username):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			user = Users.objects.get(username=username)
		
			userDB_response = requests.get(f"http://project-users-1:8000/adminuser/{user.username}/", headers=request.headers)
			if userDB_response.status_code != 200:
				return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
			
			data = request.POST
			avatar = request.FILES.get('avatar', None)
			new_password = data.get('password', None)
			first_name = data.get('first_name', userDB_response.json().get('message').get('first_name'))
			last_name = data.get('last_name', userDB_response.json().get('message').get('last_name'))
			
			if new_password:
				user.password = make_password(new_password)

			if avatar:
				if is_image(avatar) == False:
					return JsonResponse({'error': get_translated_message("IMAGE_UPLOAD_ERROR", user_language)}, status=400)
				if avatar and os.path.exists(f"/app/{userDB_response.json().get('message').get('avatar')}"):
					os.remove(f"/app/{userDB_response.json().get('message').get('avatar')}")
				new_avatar = image_to_url(avatar, user.username)
			else:
				new_avatar = userDB_response.json().get('message').get('avatar')

			user.save()

			headers = {"Accept-Language": user_language, "Authorization" : f"Bearer {user.access_token}"}
			user_data = {
				"username": user.username,
				"password": user.password,
				"avatar": new_avatar,
				"first_name": first_name,
				"last_name": last_name,
			}

			user_response = requests.post(f"http://project-users-1:8000/put/{user.username}/", json=user_data, headers=headers )

			if user_response.status_code != 200:
				return JsonResponse({'error': get_translated_message("USER_UPDATE_ERROR", user_language)}, status=500)

			return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)
		
		except Users.DoesNotExist:
			return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
		
		except Exception as e:
			return JsonResponse({'error': get_translated_message("USER_UPDATE_ERROR", user_language), 'exception': str(e)}, status=500)

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
		except Exception:
			return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", user_language)}, status=500)
	
	@csrf_exempt
	def mailDelete(request, username, token):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "DELETE":
			return JsonResponse({"error": get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		
		try:
			user = Users.objects.get(username=username)
			user.is_active = False
			
			if not MailTokens.objects.filter(user=user, token=token).exists():
				return JsonResponse({"error": get_translated_message("MAIL_TOKEN_NOT_FOUND", user_language)}, status=404)
			
			MailToken = MailTokens.objects.get(user=user, token=token)
			
			
			
			NewToken = str(uuid.uuid4())
			NewToken = MailTokens.objects.create(
                user=user,
                token=token,
                type="verify",
                expiration =  timezone.now() + timedelta(minutes=(60 * 24))
            )
			ip = os.getenv("DOMAIN")
			mail_url = f"{ip}/api/auth/verify-account/{NewToken.token}/"
			payload = {
				"email": user.email,
				"token": mail_url,
				"username": user.username,
			}
			
			response = requests.post("http://project-mail-1:8000/api/verify/", json=payload)
			user.save()
			MailToken.delete()
			if response.status_code != 200:
				return JsonResponse({"error": get_translated_message("MAIL_SEND_ERROR", user_language)}, status=500)
			
			return JsonResponse({'message': get_translated_message("SUCCESSFUL", user_language)}, status=200)
		
		except Users.DoesNotExist:
			return JsonResponse({"error": get_translated_message("USER_NOT_FOUND", user_language)}, status=404)
		except MailTokens.DoesNotExist:
			return JsonResponse({"error": get_translated_message("MAIL_TOKEN_NOT_FOUND", user_language)}, status=404)
		except requests.RequestException:
			return JsonResponse({"error": get_translated_message("MAIL_SERVICE_ERROR", user_language)}, status=500)
		except Exception as e:
			return JsonResponse({"error": get_translated_message("UNEXPECTED_ERROR", user_language)}, status=500)

	def Mailinfo(request, username, token):
		language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", language)}, status=405)
		try:
			user = Users.objects.get(username=username)

			response = MailTokens.objects.get(user=user, token=token)
			serilazier = MailTokenSerializer(response)
			return JsonResponse({'message': serilazier.data}, status=200)
		except MailTokens.DoesNotExist:
			return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", language)}, status=500)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	
	# Tüm TwoFactor List (Admin İçin) (Admin Kontrolu Edilicek)
	def twoFactorList(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "GET":
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			twofactor = TwofactorCodes.objects.all()
			serializer = TwoFactoSerializer(twofactor, many=True)
			return JsonResponse({'message': serializer.data}, status=200)
			
		except Exception:
			# Hata durumunda hata mesajı döndür
			return JsonResponse({"error": get_translated_message("USER_DATA_FETCH_ERROR", user_language)}, status=500)
