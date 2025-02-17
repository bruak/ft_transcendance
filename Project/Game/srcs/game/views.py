from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Match, Tournament

@csrf_exempt
def random_match_view(request):
	if request.method != 'POST':
		return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		match = Match.objects.filter(match_type='M',player2__isnull=True)
		if match.filter(player1=username, status='canceled').exists():
			match = match.filter(player1=username, status='canceled').first()
			match.status = 'waiting'
			match.updated_at = timezone.now()
			match.save()
			return JsonResponse({"match_id": match.id, "detail_url": f"game/room_{match.id}/"}, status=200)
		elif match.filter(player1=username, status='waiting').exists():
			match = match.filter(player1=username, status='waiting').first()
			return JsonResponse({"match_id": match.id, "detail_url": f"game/room_{match.id}/"}, status=200)
		elif match.filter(status='waiting').exists():
			match = match.filter(status='waiting').first()
			match.player2 = username
			match.status = 'playing'
			match.updated_at = timezone.now()
			match.save()
			return JsonResponse({"match_id": match.id, "detail_url": f"game/room_{match.id}/"}, status=200)
		else:
			new_match = Match.objects.create(match_type='M',
				player1 = username , 
				status='waiting')
			return JsonResponse({"match_id": new_match.id, "detail_url": f"game/room_{new_match.id}/"}, status=200)

	except Exception as e:
		return JsonResponse({"error ": str(e)}, status=500)

@csrf_exempt
def bot_mach_view(request):
	if request.method != 'POST':
		return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		match = Match.objects.filter(match_type='S',player2__isnull=True)
		if match.filter(player1=username, status='canceled').exists():
			match = match.filter(player1=username, status='canceled').first()
			match.status = 'waiting'
			match.updated_at = timezone.now()
			match.save()
			return JsonResponse({"match_id": match.id, "detail_url": f"bot/room_{match.id}/"}, status=200)
		elif match.filter(player1=username, status='waiting').exists():
			match = match.filter(player1=username, status='waiting').first()
			return JsonResponse({"match_id": match.id, "detail_url": f"bot/room_{match.id}/"}, status=200)
		elif match.filter(status='waiting').exists():
			match = match.filter(status='waiting').first()
			match.player2 = username
			match.status = 'playing'
			match.updated_at = timezone.now()
			match.save()
			return JsonResponse({"match_id": match.id, "detail_url": f"bot/room_{match.id}/"}, status=200)
		else:
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
		return JsonResponse({"playing_matches": matches_list}, status=200)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)
