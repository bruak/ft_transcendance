from django.contrib import admin
from .models import Users, MailTokens

admin.site.register(Users)
admin.site.register(MailTokens)
# Register your models here.
