from django.urls import path
from .views import translation_auth, translation_friend, translation_user, translation_geteway, translation_mail

urlpatterns = [
    path("get_translation/", translation_auth, name="get_translation"),
    path("get_translation_friend/", translation_friend, name="get_translation_friend"),
    path("get_translation_user/", translation_user, name="get_translation_user"),
    path("get_translation_geteway/", translation_geteway, name="get_translation_geteway"),
    path("get_translation_mail/", translation_mail, name="get_translation_mail"),
]