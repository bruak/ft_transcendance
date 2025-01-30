from django.urls import path
from .views import translation

urlpatterns = [
    path("get_translation/", translation, name="get_translation"),
]