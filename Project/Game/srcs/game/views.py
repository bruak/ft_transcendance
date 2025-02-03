from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth.decorators import login_required

from .models import Match

@login_required
def random_match_view(request):
	match = GameSatats.objects.filter(match_type='M',status='waiting',player2__isnull=True).first()
	if match:
		match.player2 = request.user.username # burda calismayacak degisecek 
		match.status = 'playing'
		match.created_at = timezone.now()
		match.save()
		return redirect('game:match', match_id=match.id)
	else:
		new_match = Match.objects.create(match_type='M'
			,player1 = request.user.username, # burda calismayacak degisecek 
			status='waiting')
		return redirect('game:match', match_id=new_match.id)
