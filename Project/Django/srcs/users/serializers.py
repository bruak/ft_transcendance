from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_avatar(self, obj):
        # Tam URL oluşturmak için request bağlamını kullanıyoruz
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None