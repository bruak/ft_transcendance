from django.urls import path
from .views import mail_send, send_reset_email, reset_password, send_verification_email, send_2fa_email

urlpatterns = [
	path('sendmail/', mail_send, name='mail_send'),
	path('2fa/', send_2fa_email, name='2fa'),
	path('verify/', send_verification_email, name="verify" ),
	path('send-reset-email/', send_reset_email, name='send_reset_email'),
	path('reset-password/<str:token>', reset_password, name='reset_password'),
]
