from django.urls import path
from .views import signup, verifyAccount, signin, twofactor, intra_login, callback, singout, validate_token, retry_verification_account

urlpatterns = [
	path('signup/', signup, name='register'),
	path('intra/', intra_login, name='intra_login'),
	path('callback/', callback, name='callback'),
	path('signin/', signin, name='login'),
	path('twofactor/', twofactor, name='twofactor'),
	path('verify-account/<str:verify_token>', verifyAccount),
	path('singout/', singout, name='singout'),
	path('validate-token/', validate_token, name='validate_token'),
	path('retry-verification-account/', retry_verification_account, name='retry_verification_account'),
]
