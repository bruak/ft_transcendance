from django.urls import path
from .usersViews import UserRequest
from .authViews import AuthRequest
from .intraViews import IntraRequest
from .adminViews import AdminRequest
from .views import MiscRequest

# User-related URLs
user_patterns = [
    path('singup/', UserRequest.singup, name='register'),
    path('singin/', UserRequest.singin, name='login'),
    path('singout/', UserRequest.singout, name='singout'),
    path('put/', UserRequest.user_update, name='user-update'),
]

# Authentication-related URLs validate_mail_token
auth_patterns = [
    path('twofactor/', AuthRequest.twofactor, name='twofactor'),
    path('verify-account/<str:verify_token>/', AuthRequest.verifyAccount),
    path('validate-token/', AuthRequest.validate_token, name='validate_token'),
    path('retry-verification-account/', AuthRequest.retry_verification_account, name='retry_verification_account'),
    path('forget_password/<str:username>/', AuthRequest.forget_password, name="forget_password"),
    path('reset_password/<str:token>/', AuthRequest.reset_password, name="reset_password"),
    path('validate_mail_token/<str:type>/<str:token>/', AuthRequest.validate_mail_token, name="validate_mail_token"),
    path('resend-code/', AuthRequest.twofactor_again, name='twofactor-again'),
]

# Intra-related URLs
intra_patterns = [
    path('intra/', IntraRequest.intra_login, name='intra_login'),
    path('callback/<str:code>/', IntraRequest.callback, name='callback'),
]

# Admin-related URLs
admin_patterns = [
    path('validate_admin/', AdminRequest.validate_admin, name="admin"),
    path('delete/<str:username>/', AdminRequest.user_delete, name="delete"),
    path('listusers/<str:username>/', AdminRequest.listUsers, name="listUsers"),
    path('adminput/<str:username>/', AdminRequest.admin_user_update, name="adminupdate"),
    
    #mail 
    path('listmail/', AdminRequest.MailTokenlist, name="mailtokenlist"),
    path('mailDelete/<str:username>/<str:token>/', AdminRequest.mailDelete, name="mailDelete"),
    path('mailinfo/<str:username>/<str:token>/', AdminRequest.Mailinfo, name="infoMai"),

    #twofactor tokens
    path('listtwofactor/', AdminRequest.twoFactorList, name="twofactorlist"),
]

# Miscellaneous URLs
misc_patterns = [
    path('userexists/<str:username>/', MiscRequest.user_exists, name="user_exists"),
    path('get-username/', MiscRequest.validate_get_username, name="username"),
]


# Combine all URL patterns
urlpatterns = user_patterns + auth_patterns + intra_patterns + admin_patterns + misc_patterns
