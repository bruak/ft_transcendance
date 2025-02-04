from django.urls import path
from .views import singup, verifyAccount, singin, twofactor, intra_login, callback, singout, validate_token, retry_verification_account

urlpatterns = [
	path('singup/', singup, name='register'),
	path('intra/', intra_login, name='intra_login'),
	path('callback/<str:code>/', callback, name='callback'),
	path('singin/', singin, name='login'),
	path('twofactor/', twofactor, name='twofactor'),
	path('verify-account/<str:verify_token>/', verifyAccount),
	path('singout/', singout, name='singout'),
	path('validate-token/', validate_token, name='validate_token'),
	path('retry-verification-account/', retry_verification_account, name='retry_verification_account'),
]
