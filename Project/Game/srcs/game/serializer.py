from .models import GameSatats
from rest_framework import serializers

class GameSatatsSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameSatats
		fields = '__all__'


