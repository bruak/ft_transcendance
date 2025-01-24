from django.db import models

class Friends(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()  # ID'yi integer olarak saklıyoruz
    friend_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
