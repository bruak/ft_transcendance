from django.urls import path
from .views import singup, verifyAccount, singin, twofactor, intra_login, callback

urlpatterns = [
	path('singup/', singup, name='register'),
	path('intra/', intra_login, name='intra_login'),
	path('callback/', callback, name='callback'),
	path('singin/', singin, name='login'),
	path('twofactor/', twofactor, name='twofactor'),
	path('verify-account/<str:verify_token>', verifyAccount),
]
