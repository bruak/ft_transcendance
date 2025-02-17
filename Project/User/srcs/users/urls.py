from django.urls import path
from .views import adminlist, user_delete
from .views import UserRequest
from .adminViews import UserAdminRequest

urlpatterns = [
	path('put/<str:username>/', UserRequest.user_update, name='user-update'),
	path('getuser/<str:username>/', UserRequest.user_get, name='user_get'),
	path('get/', UserRequest.user_list, name='user-list'),
	path('postjson/', UserRequest.user_createJSON, name='user-createJSON'),
    path('search/<str:query>/', UserRequest.search, name='user-search'),
    
    # Admin Url
    path('list/<str:username>/', UserAdminRequest.adminlist, name="adminlist"),
    path('delete/<str:username>/', UserAdminRequest.user_delete, name="delete"),
    
]
