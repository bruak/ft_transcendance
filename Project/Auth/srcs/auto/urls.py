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

# Authentication-related URLs
auth_patterns = [
    path('twofactor/', AuthRequest.twofactor, name='twofactor'),
    path('verify-account/<str:verify_token>/', AuthRequest.verifyAccount),
    path('validate-token/', AuthRequest.validate_token, name='validate_token'),
    path('retry-verification-account/', AuthRequest.retry_verification_account, name='retry_verification_account'),
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
    path('listtwofactor/', AdminRequest.twoFactorList, name="twofactorlist"),
    path('listusers/<str:username>/', AdminRequest.listUsers, name="listUsers"),
    path('listmail/', AdminRequest.MailTokenlist, name="mailtokenlist"),
]

# Miscellaneous URLs
misc_patterns = [
    path('userexists/<str:username>/', MiscRequest.user_exists, name="user_exists"),
    path('get-username/', MiscRequest.validate_get_username, name="username"),
]


# Combine all URL patterns
urlpatterns = user_patterns + auth_patterns + intra_patterns + admin_patterns + misc_patterns
