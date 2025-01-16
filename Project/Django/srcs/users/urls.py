from django.urls import path
from .views import user_list, user_create, user_update, login, callback, add_friend

urlpatterns = [
	path('friend/', add_friend, name='friend'),
	path('login/', login, name='login'),
	path('callback/', callback, name='callback'),
	path('put/<int:pk>', user_update, name='user-update'),
	path('get/', user_list, name='user-list'),
	path('post/', user_create, name='user-create'),
]
