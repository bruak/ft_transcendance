from django.urls import path
from .views import notification_create, online_users_view

urlpatterns = [
	path('create/', notification_create),
	path('online-users/', online_users_view),
]
