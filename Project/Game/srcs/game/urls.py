from django.urls import path
from .views import random_match_view

urlpatterns = [
	path('random-match/', random_match_view, name='random_match'),
]
