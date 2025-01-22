from django.urls import path
from .views import signup, verifyAccount, signin, twofactor, intra_login, callback

urlpatterns = [
	path('signup/', signup, name='register'),
	path('intra/', intra_login, name='intra_login'),
	path('callback/', callback, name='callback'),
	path('signin/', signin, name='login'),
	path('twofactor/', twofactor, name='twofactor'),
	path('verify-account/<str:verify_token>', verifyAccount),
]
