from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Match, Tournament, Participant
from django.db import transaction
from .translate_way import get_translated_message

class GameView(View):
	@csrf_exempt
	def random_match_view(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": get_translated_message("USERNAME_IS_REQUIRED", user_language)}, status=400)
			match_query = Match.objects.filter(match_type='M',player2__isnull=True)

			waiting_match = match_query.filter(player1=username, status='waiting').first()
			if waiting_match:
				return JsonResponse({"match_id": waiting_match.id, "detail_url": f"game/room_{waiting_match.id}/" }, status=200)

			available_match = match_query.filter(status='waiting').first()
			if available_match:
				available_match.player2 = username
				available_match.status = 'playing'
				available_match.updated_at = timezone.now()
				available_match.save()
				return JsonResponse({
					"match_id": available_match.id,
					"detail_url": f"game/room_{available_match.id}/"
				}, status=200)

			new_match = Match.objects.create(match_type='M', player1=username, status='waiting')
			return JsonResponse({"match_id": new_match.id, "detail_url": f"game/room_{new_match.id}/" }, status=200)
		except Exception as e:
			return JsonResponse({"error ": str(e)}, status=500)

	@csrf_exempt
	def bot_mach_view(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": get_translated_message("USERNAME_IS_REQUIRED", user_language)}, status=400)
			new_match = Match.objects.create(match_type='S',
				player1 = username ,
				player2 = 'bot',
				status='waiting')
			return JsonResponse({"match_id": new_match.id, "detail_url": f"bot/room_{new_match.id}/"}, status=200)
		except Exception as e:
			return JsonResponse({"error ": str(e)}, status=500)


	@csrf_exempt
	def playing_matches_view(request):
		user_language = request.headers.get("Accept-Language", "tr")
		try:
			playing_matches = Match.objects.filter(status='playing')
			matches_list = [
				{
					"match_id": match.id,
					"player1": match.player1,
					"player2": match.player2,
					"timestamp": match.updated_at,
					"detail_url": f"game/room_{match.id}/" if match.match_type == 'M' else f"bot/room_{match.id}/"
				}
				for match in playing_matches
			]
			return JsonResponse({"message": matches_list}, status=200)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def create_tournament_view(request):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			data = JSONParser().parse(request)
			name = data.get('name')
			username = data.get('created_by')
			player_limit = data.get('player_count')
			if not all([name, username, player_limit]):
				return JsonResponse({"error": get_translated_message("MISSING_REQUEST_FIELDS", user_language)}, status=400)
			if Tournament.objects.filter(name=name,status='upcoming').exists():
				return JsonResponse({"error": get_translated_message("TOURNAMENT_NAME_ALREADY_EXISTS", user_language)}, status=400)
			tournament = Tournament.objects.create(
				name=name,
				status='upcoming',
				creator=username,
				player_limit=player_limit
			)
			return JsonResponse({
				"tournament_id": tournament.id,
				"detail_url": f"/tournament/{tournament.id}/"
			}, status=201)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def join_tournament_view(request, tournament_id):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": get_translated_message("USERNAME_IS_REQUIRED", user_language)}, status=400)

			tournament = Tournament.objects.get(id=tournament_id)
			if tournament.status != 'upcoming':
				return JsonResponse({"error": get_translated_message("TOURNAMENT_IS_NOT_OPEN", user_language)}, status=400)
			if (tournament.current_players + 1) > tournament.player_limit:
				return JsonResponse({"error": get_translated_message("TOURNAMENT_IS_FULL", user_language)}, status=400)
			if Participant.objects.filter(tournament=tournament, username=username).exists():
				return JsonResponse({"error": get_translated_message("USER_IS_ALREADY_A_PARTICIPANT", user_language)}, status=400)

			Participant.objects.create(tournament=tournament, username=username)
			tournament.current_players += 1
			tournament.save()
			return JsonResponse({"message": get_translated_message("JOINED_TOURNAMENT_SUCCESSFULLY", user_language)}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": get_translated_message("TOURNAMENT_NOT_FOUND", user_language)}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def start_tournament_view(request, tournament_id):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'POST':
			return JsonResponse({'error': get_translated_message("ONLY_POST_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			tournament = Tournament.objects.get(id=tournament_id)
			if tournament.status != 'upcoming':
				return JsonResponse({"error": get_translated_message("TOURNAMENT_IS_NOT_OPEN", user_language)}, status=400)
			
			participants = list(tournament.participants.all())
			participant_count = len(participants)
			
			if participant_count < 4 or (participant_count & (participant_count - 1)) != 0 or participant_count != tournament.player_limit:
				return JsonResponse({"error": get_translated_message("NUMBER_OF_PARTICIPANTS_MUST_2_LEAST_4", user_language)}, status=400)
			import random
			random.shuffle(participants)
			with transaction.atomic():
				tournament.status = 'ongoing'
				tournament.save()
				matches = []
				for i in range(0, participant_count, 2):
					match = Match.objects.create(
						tournament=tournament,
						match_type='T',
						player1=participants[i].username,
						player2=participants[i+1].username,
						status='waiting'
					)
					matches.append(match)
				for match in matches:
					room_name = f"tournament_{match.id}"
					match.detail_url = f"game/room_{match.id}/"
					match.save()
				
				return JsonResponse({
					"message": "Tournament started successfully.",
					"matches": [{"match_id": match.id, "detail_url": match.detail_url} for match in matches]
				}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": get_translated_message("TOURNAMENT_NOT_FOUND", user_language)}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	
	@csrf_exempt
	def playing_tournament_views(request, tournament_id):
		user_language = request.headers.get("Accept-Language", "tr")
		if request.method != 'GET':
			return JsonResponse({"error": get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
		try:
			tournament = Tournament.objects.get(id=tournament_id)
			matches = tournament.matches.filter(status='waiting')
			matches_list = [
				{
					"match_id": match.id,
					"player1": match.player1,
					"player2": match.player2 or "waiting",
					"creator": match.tournament.creator,
					"detail_url": f"game/room_{match.id}/"
				}
				for match in matches
			]
			return JsonResponse({"message": matches_list}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": get_translated_message("TOURNAMENT_NOT_FOUND", user_language)}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def list_tournaments_view(request):
		user_language = request.headers.get("Accept-Language", "tr")
		try:
			tournaments = Tournament.objects.filter(status='upcoming')
			tournaments_list = [
				{
					"tournament_id": tournament.id,
					"name": tournament.name,
					"status": tournament.status,
					"creator": tournament.creator,
					"current_players": tournament.current_players,
					"player_count": tournament.player_limit,
				}
				for tournament in tournaments
			]
			return JsonResponse({"message": tournaments_list}, status=200)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

