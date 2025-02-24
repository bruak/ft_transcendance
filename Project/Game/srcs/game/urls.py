from django.urls import path
from .views import GameView 

urlpatterns = [
	path('random-match/', GameView.random_match_view, name='random_match'),
	path('bot-match/', GameView.bot_mach_view, name='bot_match'),
	path('playing-matches/', GameView.playing_matches_view, name='playing_matches'),
	
	# Tournament urls
	path('create-tournament/', GameView.create_tournament_view, name='create_tournament'),
	path('active-tournaments/', GameView.list_tournaments_view, name='list_tournaments'),
	path('tournament/<int:tournament_id>/join/', GameView.join_tournament_view, name='join_tournament'),
	path('tournament/<int:tournament_id>/start/', GameView.start_tournament_view, name='start_tournament'),
	path('tournament/<int:tournament_id>/playing/', GameView.playing_tournament_views, name='playing_tournament'),
]
