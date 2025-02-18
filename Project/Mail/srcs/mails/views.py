from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from rest_framework.parsers import JSONParser
from .models import Profile
import requests
from django.shortcuts import render
from .translate_way import get_translated_message
from django.views import View

class MailRequest(View):
	@csrf_exempt
	def send_reset_email(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method == 'POST':
			try:
				# Gelen veriyi JSON olarak parse et
				data = JSONParser().parse(request)
				username = data.get('username')

				if not username:
					return JsonResponse({'error': get_translated_message("USERNAME_REQUIRED", user_language)}, status=400)

				# Kullanıcı bilgilerini başka bir API'den al
				user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")

				if user_response.status_code != 200:
					return JsonResponse({'error': get_translated_message("USER_NOT_FOUND", user_language)}, status=404)

				user_json = user_response.json().get('message')

				# Token oluştur ve profili kaydet
				token = get_random_string(32)

				Profile.objects.create(
					username=user_json.get('username'),
					reset_token=token
				)
				# Şifre sıfırlama bağlantısı oluştur
				reset_link = f"https://localhost:8080/api/mail/api/reset-password/{token}/"
				# Mail gönder
				send_mail(
					subject=get_translated_message("PASSWORD_RESET_REQUEST", user_language),
					message=get_translated_message("PASSWORD_RESET_LINK", user_language) + " " + reset_link,
					from_email='lmrnbzkrt0@gmail.com',
					recipient_list=[user_json.get('email')],
				)
				return JsonResponse({'message': get_translated_message("PASSWORD_RESET_SENT", user_language)}, status=200)
			except Exception as e:
				return JsonResponse({'error': get_translated_message("GENERIC_ERROR", user_language), get_translated_message("DETAILS", user_language): str(e)}, status=500)
		return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)

	@csrf_exempt
	def reset_password(request, token):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method == 'POST':
			data = JSONParser().parse(request)
			new_password = data.get('password')
			try:
				profile = Profile.objects.get(reset_token=token)
				username = profile.username
				user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")
				user_data = user_response.json().get('message')
				payload = {
					"password" : new_password
				}
				# Değişicek
				headers = {
					"Content-Type": "application/x-www-form-urlencoded"
				}
				return (JsonResponse({'maraba': "Burdasın"}))
				#update_response = requests.post(f"http://project-users-1:8000/put/{username}/", data=payload,  headers=headers)
				if update_response.status_code == 200:
					profile.reset_token = None
					profile.save()
					return HttpResponse(get_translated_message("PASSWORD_CHANGED_SUCCESS", user_language), status=200)
				else:
					return HttpResponse(get_translated_message("PASSWORD_UPDATE_ERROR", user_language), status=400)
			except Profile.DoesNotExist:
				return HttpResponse(get_translated_message("INVALID_OR_EXPIRED_CONNECTION", user_language), status=400)
		return render(request, 'reset_password.html', {'token': token}, status=200)

	@csrf_exempt
	def send_verification_email(request):
		# `request` parametresini doğru şekilde kullanıyoruz
		subject = "Verify Mail"
		data = JSONParser().parse(request)
		# Token ve mail adresini request'ten alıyoruz
		message = data.get("token")  # GET ile alınan parametre
		mail = data.get("email")  # mail parametresi de GET ile alınıyor
		# Mail gönderme işlemi
		from_email = 'lmrnbzkrt0@gmail.com'
		# Email gönderimi
		send_mail(
			subject=subject,
			message=message,
			from_email=from_email,
			recipient_list=[mail],  # Alıcıyı liste halinde veriyoruz
			fail_silently=False  # Eğer bir hata olursa yakalansın
		)
		# Başarılı olduğunda bir JsonResponse dönüyoruz
		return JsonResponse({"message": mail, "status": 200})

	@csrf_exempt
	def send_2fa_email(request):
		user_language = request.headers.get("Accept-Language", "tr")
		# `request` parametresini doğru şekilde kullanıyoruz
		subject = get_translated_message("VERIFY_CODE", user_language)
		data = JSONParser().parse(request)
		# Token ve mail adresini request'ten alıyoruz
		code = data.get("code")  # GET ile alınan parametre
		mail = data.get("email")  # mail parametresi de GET ile alınıyor
		# Mail gönderme işlemi
		from_email = 'lmrnbzkrt0@gmail.com'
		# Email gönderimi
		send_mail(
			subject=subject,
			message=code,
			from_email=from_email,
			recipient_list=[mail],  # Alıcıyı liste halinde veriyoruz
			fail_silently=False  # Eğer bir hata olursa yakalansın
		)
		# Başarılı olduğunda bir JsonResponse dönüyoruz
		return JsonResponse({"message": mail, "status": 200})

	def mail_send(request):
		user_language = request.headers.get("Accept-Language", "tr")

		subject = "Test Email"
		message = "This is a test email from Django."
		from_email = "lmrnbzkrt0@gmail.com"  # Gönderen e-posta
		recipient_list = ["buraksoykan222@hotmail.com"]  # Alıcı e-posta adresi

		try:
			send_mail(subject, message, from_email, recipient_list)
			return JsonResponse({"message": get_translated_message("EMAIL_SENT_SUCCESSFULLY", user_language)}, status=200)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
