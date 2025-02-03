from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from rest_framework.parsers import JSONParser
from .models import Profile  # Profile modelini kullandığınızı varsayıyorum
import requests
from django.shortcuts import render
from .translate_way import get_translated_mail

@csrf_exempt
def send_reset_email(request):
	user_language = request.headers.get("Accept-Language", "tr")
	if request.method == 'POST':
		try:
			# Gelen veriyi JSON olarak parse et
			data = JSONParser().parse(request)
			username = data.get('username')

			if not username:
				return JsonResponse({'error': get_translated_mail("Username required", user_language)}, status=400)

			# Kullanıcı bilgilerini başka bir API'den al
			user_response = requests.get(f"http://project-users-1:8000/getuser/{username}/")

			if user_response.status_code != 200:
				return JsonResponse({'error': get_translated_mail("User not found", user_language)}, status=404)

			user_json = user_response.json()

			# Token oluştur ve profili kaydet
			token = get_random_string(32)
			Profile.objects.create(
				username=user_json.get('username'),
				reset_token=token
			)
			# Şifre sıfırlama bağlantısı oluştur
			reset_link = f"http://127.0.0.1:8002/api/reset-password/{token}/"
			# Mail gönder
			send_mail(
				subject=get_translated_mail("Password Reset Request", user_language),
				message=get_translated_mail("Click on this link to reset your password: ", user_language) + reset_link,
				from_email='lmrnbzkrt0@gmail.com',
				recipient_list=[user_json.get('email')],
			)
			return JsonResponse({'message': get_translated_mail("Password reset link sent.", user_language)}, status=200)
		except Exception as e:
			return JsonResponse({'error': get_translated_mail("An error has occurred.", user_language), get_translated_mail("details", user_language): str(e)}, status=500)
	return JsonResponse({'error': get_translated_mail("Only POST requests are allowed.", user_language)}, status=405)


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
			user_data = user_response.json()
			payload = {
				"password" : new_password
			}

			headers = {
				"Content-Type": "application/x-www-form-urlencoded"
			}
			update_response = requests.post(f"http://project-users-1:8000/put/{username}/", data=payload,  headers=headers)
			if update_response.status_code == 200:
				profile.reset_token = None
				profile.save()
				return HttpResponse(get_translated_mail("Your password has been successfully changed. You can log in now.", user_language), status=200)
			else:
				return HttpResponse(get_translated_mail("An error occurred while updating the password.", user_language), status=400)
		except Profile.DoesNotExist:
			return HttpResponse(get_translated_mail("An invalid or expired connection. Please try again.", user_language), status=400)
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
	subject = get_translated_mail("Verify Code", user_language)
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
		return JsonResponse({"message": get_translated_mail("Email sent successfully.", user_language)}, status=200)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)
