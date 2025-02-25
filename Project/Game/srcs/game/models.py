from django.db import models

class Tournament(models.Model):
    TOURNAMENT_STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
        ('canceled', 'Canceled'),
    )

    name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=10, 
        choices=TOURNAMENT_STATUS_CHOICES, 
        default='upcoming'
    )
    current_players = models.IntegerField(default=0)
    player_limit = models.IntegerField(default=8)
    creator = models.CharField(max_length=50,null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Match(models.Model):
    MATCH_TYPE_CHOICES = (
        ('S', 'Single'),
        ('L', 'Local'),
        ('M', 'Multi'),
        ('T', 'Tournament'),
    )
    MATCH_STATUS_CHOICES = (
        ('waiting', 'Waiting'),
        ('playing', 'Playing'),
        ('finished', 'Finished'),
        ('canceled', 'Canceled'),
    )
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        related_name='matches',
        null=True,
        blank=True
    )
    match_type = models.CharField(max_length=1, choices=MATCH_TYPE_CHOICES, default='S')
    player1 = models.CharField(max_length=50, null=False)
    player2 = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=8, choices=MATCH_STATUS_CHOICES, default='waiting')
    score = models.CharField(max_length=10, null=True, blank=True)
    winner = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player1}'s game ({self.get_match_type_display()})"


class Participant(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='participants')
    username = models.CharField(max_length=50)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} in {self.tournament.name}"
