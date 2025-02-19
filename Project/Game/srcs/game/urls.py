from django.urls import path
from .views import random_match_view, bot_mach_view, playing_matches_view, create_tournament_view, list_tournaments_view
urlpatterns = [
	path('random-match/', random_match_view, name='random_match'),
	path('bot-match/', bot_mach_view, name='bot_match'),
	path('playing-matches/', playing_matches_view, name='playing_matches'),
	path('create-tournament/', create_tournament_view, name='create_tournament'),
	path('active-tournaments/', list_tournaments_view, name='list_tournaments'),
]
