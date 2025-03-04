from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.core.mail import send_mail
from rest_framework.parsers import JSONParser
from .models import Profile
import requests
from django.shortcuts import render
from .translate_way import get_translated_message
from django.views import View
import os
class MailRequest(View):

	@csrf_exempt
	def send_reset_email(request, email, token):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'GET':
			return JsonResponse({'error': get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:

			domain = os.getenv('DOMAIN')
			reset_link = f"{domain}/forget-password/{token}"
			send_mail(
				subject=get_translated_message("PASSWORD_RESET_REQUEST", user_language),
				message=get_translated_message("PASSWORD_RESET_LINK", user_language) + " " + reset_link,
				from_email='lmrnbzkrt0@gmail.com',
				recipient_list=[email]
			)
			return JsonResponse({'message': get_translated_message("PASSWORD_RESET_SENT", user_language)}, status=200)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)

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
