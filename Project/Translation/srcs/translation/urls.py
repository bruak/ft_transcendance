from django.urls import path
from .views import translation

urlpatterns = [
	path("translation/<str:key>/", translation, name="get_translation"),
]
