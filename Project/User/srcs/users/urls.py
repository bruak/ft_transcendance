from django.urls import path
from .views import UserRequest
from .adminViews import UserAdminRequest

urlpatterns = [
	path('put/<str:username>/', UserRequest.user_update, name='user-update'),
	path('getuser/<str:username>/', UserRequest.user_get, name='user_get'),
	path('get/', UserRequest.user_list, name='user-list'),
	path('postjson/', UserRequest.user_createJSON, name='user-createJSON'),
    path('search/<str:query>/', UserRequest.search, name='user-search'),
    # Admin
    path('list/<str:username>/', UserAdminRequest.as_view(), name="adminlist"),
    path('adminuser/<str:username>/', UserAdminRequest.as_view(), name="adminuser"),
    path('delete/<str:username>/', UserAdminRequest.as_view(), name="delete"),

]
