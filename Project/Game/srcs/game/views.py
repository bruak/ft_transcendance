from django.shortcuts import render
from django.utils import timezone
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from django.http import JsonResponse

from .models import Match

@api_view(['POST'])
def random_match_view(request):
	if request.method != 'POST':
		return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
	try:
		data = JSONParser().parse(request)
		username = data.get('username')
		match = Match.objects.filter(match_type='M',status='waiting',player2__isnull=True).first()
		if match:
			match.player2 = username 
			match.status = 'playing'
			match.created_at = timezone.now()
			match.save()
			return JsonResponse({"match_id": match.id, "detail_url": f"/match/{match.id}/"}, status=200)
		else:
			new_match = Match.objects.create(match_type='M',
				player1 = username , 
				status='waiting')
			return JsonResponse({"match_id": new_match.id, "detail_url": f"room_{new_match.id}/"}, status=200)

	except Exception as e:
		return JsonResponse({"error ": str(e)}, status=500)
