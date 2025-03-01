from django.urls import path
from .views import notification_create 

urlpatterns = [
	path('create/', notification_create),
]
