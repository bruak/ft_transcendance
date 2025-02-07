from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'avatar']

    def create(self, validated_data):
        # Gelen avatar verisini işliyoruz
        avatar = validated_data.get('avatar')
        if not avatar:  # Eğer avatar gönderilmemişse varsayılan bir avatar atayın
            validated_data['avatar'] = "/media/avatars/default.jpg"
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            # Avatar alanına tam bir URL ekleyin
            representation['avatar'] = request.build_absolute_uri(instance.avatar)
        return representation
