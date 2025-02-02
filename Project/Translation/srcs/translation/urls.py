from django.urls import path
from .views import translation_auth, translation_friend

urlpatterns = [
    path("get_translation/", translation_auth, name="get_translation"),
    path("get_translation_friend/", translation_friend, name="get_translation_friend"),
]