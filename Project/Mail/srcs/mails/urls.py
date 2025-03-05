from django.urls import path
from .views import MailRequest

urlpatterns = [
	path('2fa/', MailRequest.send_2fa_email, name='2fa'),
	path('verify/', MailRequest.send_verification_email, name="verify" ),
	path('reset-password/<str:email>/<str:token>/', MailRequest.send_reset_email, name='send_reset_email'),
]
