from django.urls import path
from .views import user_list, user_create, user_update, login, callback, user_get, user_createJSON

urlpatterns = [
	path('login/', login, name='login'),
	path('callback/', callback, name='callback'),
	path('put/<str:username>', user_update, name='user-update'),
	path('getuser/<str:username>', user_get, name='user_get'),
	path('get/', user_list, name='user-list'),
	path('post/', user_create, name='user-create'),
	path('postjson/', user_createJSON, name='user-createJSON'),
]
