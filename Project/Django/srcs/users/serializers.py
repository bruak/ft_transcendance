from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
	avatar = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['id','first_name', 'last_name', 'username', 'email', 'avatar']

	def get_avatar(self, obj):
		request = self.context.get('request')
		if obj.avatar:
			return request.build_absolute_uri(obj.avatar) if request else obj.avatar
		return None