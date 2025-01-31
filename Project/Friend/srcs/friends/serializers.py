from rest_framework import serializers
from .models import Friends

class FriendsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Friends
		fields = "__all__"
