from django.urls import path
from .views import mail_send, send_reset_email, reset_password

urlpatterns = [
	path('sendmail/', mail_send, name='mail_send'),
	path('send-reset-email/', send_reset_email, name='send_reset_email'),
    path('reset-password/<str:token>', reset_password, name='reset_password'),
]
