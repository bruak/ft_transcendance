from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'avatar']

    def __init__(self, *args, hide_email=False, **kwargs):
        super().__init__(*args, **kwargs)
        if hide_email:
            self.fields.pop('email')

    def create(self, validated_data):

        avatar = validated_data.get('avatar')
        if not avatar:
            validated_data['avatar'] = "/media/avatars/default.jpg"
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            representation['avatar'] = request.build_absolute_uri(instance.avatar)
        return representation
    
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def create(self, validated_data):

        avatar = validated_data.get('avatar')
        if not avatar:
            validated_data['avatar'] = "/media/avatars/default.jpg"
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar and request:
            representation['avatar'] = request.build_absolute_uri(instance.avatar)
        return representation
