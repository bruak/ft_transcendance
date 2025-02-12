from django.urls import path
from .views import singup, verifyAccount, singin, twofactor, intra_login, callback, singout, validate_token, retry_verification_account, user_update, user_delete, MailTokenlist, twoFactorList, listUsers, validate_admin

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
    path('put/<str:username>/', user_update, name='user-update'),
    path('delete/<str:username>/', user_delete, name="delete"),
    path('listmail/', MailTokenlist, name="mailtokenlist"),
    path('listtwofactor/', twoFactorList, name="twofactorlist"),
    path('listusers/<str:username>/', listUsers, name="listUsers"),
    path('validate_admin/', validate_admin, name="admin"  ),
]
