from django.core.mail import send_mail
from django.http import JsonResponse

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

# Create your views here.
