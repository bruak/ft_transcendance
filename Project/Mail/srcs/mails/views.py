from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.core.mail import send_mail
from rest_framework.parsers import JSONParser
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
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		subject = "Verify Mail"
		data = JSONParser().parse(request)
		message = data.get("token")
		mail = data.get("email")
		from_email = 'lmrnbzkrt0@gmail.com'
		send_mail(
			subject=subject,
			message=message,
			from_email=from_email,
			recipient_list=[mail],
			fail_silently=False
		)

		return JsonResponse({"message": mail, "status": 200})

	@csrf_exempt
	def send_2fa_email(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != "POST":
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)

		subject = get_translated_message("VERIFY_CODE", user_language)
		data = JSONParser().parse(request)
		code = data.get("code")
		mail = data.get("email")
		from_email = 'lmrnbzkrt0@gmail.com'
		send_mail(
			subject=subject,
			message=code,
			from_email=from_email,
			recipient_list=[mail],
			fail_silently=False
		)
		
		return JsonResponse({"message": mail, "status": 200})
