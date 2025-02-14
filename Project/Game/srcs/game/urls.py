from django.urls import path
from .views import random_match_view, bot_mach_view, playing_matches_view

urlpatterns = [
	path('random-match/', random_match_view, name='random_match'),
	path('bot-match/', bot_mach_view, name='bot_match'),
	path('playing-matches/', playing_matches_view, name='playing_matches'),
]
