from django.urls import path
from .views import MailRequest

urlpatterns = [
	path('sendmail/', MailRequest.mail_send, name='mail_send'),
	path('2fa/', MailRequest.send_2fa_email, name='2fa'),
	path('verify/', MailRequest.send_verification_email, name="verify" ),
	path('send-reset-email/', MailRequest.send_reset_email, name='send_reset_email'),
	path('reset-password/<str:token>/', MailRequest.reset_password, name='reset_password'),
]
