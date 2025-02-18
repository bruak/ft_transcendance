from rest_framework import serializers
from .models import MailTokens, TwofactorCodes

class MailTokenSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email')

    class Meta:
        model = MailTokens
        fields = ['username', 'email', 'type', 'expiration', 'status']  


class TwoFactoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email')

    class Meta:
        model = TwofactorCodes
        fields = ['username', 'email', 'expiration', 'status']  