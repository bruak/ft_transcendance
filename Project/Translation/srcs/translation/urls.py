from django.urls import path
from .views import translation_auth

urlpatterns = [
    path("get_translation/", translation_auth, name="get_translation"),
]