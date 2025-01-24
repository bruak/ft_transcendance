from django.db import models


class Profile(models.Model):
	username = models.CharField(max_length=100, unique=True)
	reset_token = models.CharField(max_length=64, blank=True, null=True)

	def __str__(self):
		return f"username: {self.username}"
