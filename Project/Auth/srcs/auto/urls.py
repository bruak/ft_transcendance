from django.urls import path
from .views import signup, verifyAccount

urlpatterns = [
	path('sign/', signup, name='login'),
	path('verify-account/<str:verify_token>/', verifyAccount),
]
