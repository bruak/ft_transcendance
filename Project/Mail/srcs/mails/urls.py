from django.urls import path
from .views import mail_send

urlpatterns = [
	path('sendmail/', mail_send, name='mail_send'),
]
