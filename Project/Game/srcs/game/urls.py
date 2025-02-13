from django.urls import path
from .views import random_match_view, bot_mach_view

urlpatterns = [
	path('random-match/', random_match_view, name='random_match'),
	path('bot-match/', bot_mach_view, name='bot_match'),
]
