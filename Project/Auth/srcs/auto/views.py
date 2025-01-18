from django.shortcuts import render
from .models import Users, MailTokens
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
import uuid
import requests
from django.views.decorators.csrf import csrf_exempt


from rest_framework.parsers import JSONParser
from .tools import image_to_url

#Test Etmen lazım
@csrf_exempt
def signup(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		username = request.POST.get('username')
		email = request.POST.get('email')
		password = request.POST.get('password')
		avatar_file = request.FILES.get('avatar', None)
		avatar_url = image_to_url(avatar_file, username)
		#if username_check(username):
		#	return JsonResponse({'message': "bu username var"})
		if Users.objects.filter(email=email).exists():
			return JsonResponse({'message': "Mail Zaten Var"})

		user = Users.objects.create(
			username=username,
			email=email,
			password=password,
			is_active = False,
			#avatar = avatar_url
		)

		token = str(uuid.uuid4())

		MailTokens.objects.create(
				user=user,
				token=token,
				type="verify",
				expiration=  timezone.now() + timedelta(minutes=(60 * 24)) # 1 gün
		)

		headers = {"Accept-Language": "application/json"}
		user_data = {
			"username": username,
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			#"source_id": user.id,
			"avatar": avatar_url,
		}
		mail_data = {
			"token": token,
			"username" : username,
			"email": email,
		}
		mail_response = requests.post(f"http://project-mail-1:8000/api/verify/", json=mail_data, headers=headers)
		if (mail_response.status_code != 200):
			return JsonResponse({'message': "Mail Gönderilmedi"})
		else:
			return JsonResponse({'message': mail_response.text})

		user_response = requests.post(f"http://project-users-1:8000/api/post/", json=user_data, headers=headers)
		if user_response.status_code != 201:
			user.delete()
			return JsonResponse({'message': "User Service Error"})
		return JsonResponse({'message': "işlem başarılı"})
	except Exception as e:
		return JsonResponse({'message': "Sigup Error", 'error': str(e)})


def signin(request):
	if request.method == "POST":
		data = JSONParser().parse(request)
		signin = data.get("sign")
		password = data.get("password")
		try:
			user = (
				Users.objects.get(email=signin)
				if "@" in signin
				else Users.objects.get(username=signin)
			)
		except Exception as e:
			return (JsonResponse({'message': "Not Found User"}))

def verifyAccount(request, verify_token):
	mail_token = MailTokens.objects.get(token=verify_token, type="verify", status=True)
	#Böyle bir token varmı diye bir kontrol ypa
	if timezone.now > mail_token.expiration:
		mail_token.status = False
		mail_token.save()
		new_token = str(uuid.uuid4())
		MailTokens.objects.create(
			user=mail_token.user,
			token=new_token,
			type="verify",
			expiration=  timezone.now() + timedelta(minutes=(60 * 24)) # 1 gün
		)
		return (JsonResponse({'message': "Mailin Süresi Doldu enayi, yeni mail gönderdik kontrol et"}))

	user = mail_token.user
	user.is_active = True
	user.save()
	return (JsonResponse({'message': "Doğrulama Yapıldı"}))
