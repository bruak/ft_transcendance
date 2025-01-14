from django.db import models
import os

class User(models.Model):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100, null=False)
    last_name = models.CharField(max_length=100, null=False)
    username = models.CharField(max_length=100, null=False)
    email = models.EmailField(max_length=100, null=False)
    password = models.CharField(max_length=100, null=False)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.jpg')
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.username
