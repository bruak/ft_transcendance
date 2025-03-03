from django.contrib import admin
from .models import Users, MailTokens, TwofactorCodes

admin.site.register(Users)
admin.site.register(MailTokens)
admin.site.register(TwofactorCodes)

# Register your models here.
    