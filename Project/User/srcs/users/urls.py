from django.urls import path
from .views import UserRequest
from .adminViews import UserAdminRequest

urlpatterns = [
	path('put/<str:username>/', UserRequest.user_update, name='user-update'),
	path('getuser/<str:username>/', UserRequest.user_get, name='user_get'),
	path('postjson/', UserRequest.user_createJSON, name='user-createJSON'),
    path('search/<str:query>/', UserRequest.search, name='user-search'),
    # Admin
	path('get/', UserAdminRequest.user_list, name='user-list'),
    #path('list/<str:username>/', UserAdminRequest.user_get, name="adminlist"),
    path('adminuser/<str:username>/', UserAdminRequest.user_get, name="adminuser"),
    path('delete/<str:username>/', UserAdminRequest.user_delete, name="delete"),


]
