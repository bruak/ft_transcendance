from django.shortcuts import render
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Match, Tournament, Participant
from django.db import transaction

class GameView(View):
	@csrf_exempt
	def random_match_view(request):
		if request.method != 'POST':
			return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": "Username is required"}, status=400)
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
		if request.method != 'POST':
			return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": "Username is required"}, status=400)
			new_match = Match.objects.create(match_type='S',
				player1 = username ,
				player2 = 'bot',
				status='waiting')
			return JsonResponse({"match_id": new_match.id, "detail_url": f"bot/room_{new_match.id}/"}, status=200)
		except Exception as e:
			return JsonResponse({"error ": str(e)}, status=500)


	@csrf_exempt
	def playing_matches_view(request):
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
		if request.method != 'POST':
			return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
		try:
			data = JSONParser().parse(request)
			name = data.get('name')
			start_date = data.get('start_date')
			end_date = data.get('end_date')
			if not all([name, start_date, end_date]):
				return JsonResponse({"error": "Missing required fields."}, status=400)
			if start_date >= end_date:
				return JsonResponse({"error": "End date must be greater than start date."}, status=400)
			if timezone.now() >= start_date:
				return JsonResponse({"error": "Start date must be greater than current date."}, status=400)
			if Tournament.objects.filter(name=name,status='upcoming').exists():
				return JsonResponse({"error": "Tournament with this name already exists."}, status=400)
			tournament = Tournament.objects.create(
				name=name,
				start_date=start_date,
				end_date=end_date,
				status='upcoming'
			)
			return JsonResponse({
				"tournament_id": tournament.id,
				"detail_url": f"/tournament/{tournament.id}/"
			}, status=201)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def join_tournament_view(request, tournament_id):
		if request.method != 'POST':
			return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
		try:
			data = JSONParser().parse(request)
			username = data.get('username')
			if not username:
				return JsonResponse({"error": "Username is required"}, status=400)
			
			tournament = Tournament.objects.get(id=tournament_id)
			if tournament.status != 'upcoming':
				return JsonResponse({"error": "Tournament is not open for joining."}, status=400)
			
			# Check if the user is already a participant
			if Participant.objects.filter(tournament=tournament, username=username).exists():
				return JsonResponse({"error": "User is already a participant."}, status=400)
			
			Participant.objects.create(tournament=tournament, username=username)
			return JsonResponse({"message": "Joined tournament successfully."}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": "Tournament not found."}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def start_tournament_view(request, tournament_id):
		if request.method != 'POST':
			return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
		try:
			tournament = Tournament.objects.get(id=tournament_id)
			if tournament.status != 'upcoming':
				return JsonResponse({"error": "Tournament is not open for starting."}, status=400)
			
			participants = list(tournament.participants.all())
			participant_count = len(participants)
			
			# Check if the number of participants is a power of 2 and at least 4
			if participant_count < 4 or (participant_count & (participant_count - 1)) != 0:
				return JsonResponse({"error": "Number of participants must be a power of 2 and at least 4."}, status=400)
			
			# Shuffle participants to randomize matchups
			import random
			random.shuffle(participants)
			
			# Create matches
			with transaction.atomic():
				tournament.status = 'ongoing'
				tournament.save()
				
				# Create first round matches
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
				
				# Start WebSocket connections for each match
				for match in matches:
					room_name = f"tournament_{match.id}"
					# Burada WebSocket bağlantısını başlatabilirsiniz.
					# Örneğin, bir WebSocket URL'si oluşturabilir ve bu URL'yi frontend'e iletebilirsiniz.
					match.detail_url = f"/ws/tournament/{room_name}/"
					match.save()
				
				return JsonResponse({
					"message": "Tournament started successfully.",
					"matches": [{"match_id": match.id, "detail_url": match.detail_url} for match in matches]
				}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": "Tournament not found."}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	@csrf_exempt
	def playing_tournament_views(request, tournament_id):
		if request.method != 'GET':
			return JsonResponse({"error": "Only GET requests are allowed."}, status=405)
		try:
			tournament = Tournament.objects.get(id=tournament_id)
			matches = tournament.matches.filter(status='waiting')
			matches_list = [
				{
					"match_id": match.id,
					"player1": match.player1,
					"player2": match.player2,
					"timestamp": match.updated_at,
					"detail_url": f"/game/room_{match.id}/"
				}
				for match in matches
			]
			return JsonResponse({"message": matches_list}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({"error": "Tournament not found."}, status=404)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

	@csrf_exempt
	def list_tournaments_view(request):
		try:
			tournaments = Tournament.objects.all()
			tournaments_list = [
				{
					"tournament_id": tournament.id,
					"name": tournament.name,
					"start_date": tournament.start_date,
					"end_date": tournament.end_date,
					"status": tournament.status,
				}
				for tournament in tournaments
			]
			return JsonResponse({"message": tournaments_list}, status=200)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)

