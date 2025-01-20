from django.urls import path
from .views import signup, verifyAccount, signin, twofactor

urlpatterns = [
	path('signup/', signup, name='register'),
	path('signin/', signin, name='login'),
	path('twofactor/', twofactor, name='twofactor'),
	path('verify-account/<str:verify_token>', verifyAccount),
]
