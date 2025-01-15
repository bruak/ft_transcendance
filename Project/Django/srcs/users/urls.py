from django.urls import path
from .views import UserViewSet, UserDeleteView, user_list, user_create, user_update, intra, login, callback

urlpatterns = [
	path('login/', login, name='login'),
    path('callback/', callback, name='callback'),
    path('42/', intra, name='get_cursus_users'),
	path('put/<int:pk>', user_update, name='user-update'),
	path('get/', user_list, name='user-list'),
	path('post/', user_create, name='user-create'),
	path('users/', UserViewSet.as_view(), name='users'),
	path('users/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
]
