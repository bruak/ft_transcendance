from django.db import models

class GameSatats(models.Model):
	id = models.AutoField(primary_key=True)
	host = models.CharField(max_length=100, null=False)
	guest = models.CharField(max_length=100, null=False)
	winner = models.CharField(max_length=100, null=False)
	winner_score = models.IntegerField(null=False)
	loser_score = models.IntegerField(null=False)
	created_at = models.DateTimeField(auto_now_add=True, null=False)
	updated_at = models.DateTimeField(auto_now=True, null=False)
	gambing = models.BooleanField(default=False)
	game_rooom = models.CharField(max_length=100, null=False)
	def __str__(self):
		return self.host + " vs " + self.guest
	 
