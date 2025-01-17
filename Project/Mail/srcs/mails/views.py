from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from rest_framework.parsers import JSONParser
from .models import Profile  # Profile modelini kullandığınızı varsayıyorum
import requests
from django.shortcuts import render

@csrf_exempt
def send_reset_email(request):
	if request.method == 'POST':
		try:
			# Gelen veriyi JSON olarak parse et
			data = JSONParser().parse(request)
			username = data.get('username')

			if not username:
				return JsonResponse({'error': 'Kullanıcı adı gereklidir.'}, status=400)

			# Kullanıcı bilgilerini başka bir API'den al
			user_response = requests.get(f"http://project-users-1:8000/api/getuser/{username}")

			if user_response.status_code != 200:
				return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

			user_json = user_response.json()

			# Token oluştur ve profili kaydet
			token = get_random_string(32)
			Profile.objects.create(
				username=user_json.get('username'),
				reset_token=token
			)
			# Şifre sıfırlama bağlantısı oluştur
			reset_link = f"http://127.0.0.1:8002/api/reset-password/{token}"
			# Mail gönder
			send_mail(
				subject="Şifre Sıfırlama Talebi",
				message=f"Şifrenizi sıfırlamak için şu bağlantıya tıklayın: {reset_link}",
				from_email='lmrnbzkrt0@gmail.com',
				recipient_list=[user_json.get('email')],
			)
			return JsonResponse({'message': 'Şifre sıfırlama bağlantısı gönderildi.'}, status=200)
		except Exception as e:
			return JsonResponse({'error': 'Bir hata oluştu.', 'details': str(e)}, status=500)
	return JsonResponse({'error': 'GET isteği desteklenmiyor.'}, status=405)


@csrf_exempt
def reset_password(request, token):
	if request.method == 'POST':
		data = JSONParser().parse(request)
		new_password = data.get('password')
		try:
			profile = Profile.objects.get(reset_token=token)
			username = profile.username
			user_response = requests.get(f"http://project-users-1:8000/api/getuser/{username}")
			user_data = user_response.json()
			payload = {
				"password" : new_password
			}

			headers = {
				"Content-Type": "application/x-www-form-urlencoded"
			}
			update_response = requests.post(f"http://project-users-1:8000/api/put/{username}", data=payload,  headers=headers)
			if update_response.status_code == 200:
				profile.reset_token = None
				profile.save()
				return HttpResponse("Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.")
			else:
				return HttpResponse("Şifre güncellenirken bir hata oluştu.", status=400)
		except Profile.DoesNotExist:
			return HttpResponse("Geçersiz veya süresi dolmuş bir bağlantı.")
	return render(request, 'reset_password.html', {'token': token})



def mail_send(request):
	subject = "Test Email"
	message = "This is a test email from Django."
	from_email = "lmrnbzkrt0@gmail.com"  # Gönderen e-posta
	recipient_list = ["buraksoykan222@hotmail.com"]  # Alıcı e-posta adresi

	try:
		send_mail(subject, message, from_email, recipient_list)
		return JsonResponse({"message": "Email sent successfully."}, status=200)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)
