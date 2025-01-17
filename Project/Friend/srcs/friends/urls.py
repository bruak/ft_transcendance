from .views import add_friend
from django.urls import path

urlpatterns = [
	path('friend/', add_friend, name='friend'),
]
