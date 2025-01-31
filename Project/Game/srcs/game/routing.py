from django.urls import path
from game.consumers import PongConsumer

websocket_urlpatterns = [
    path("ws/game/<str:room_name>/", PongConsumer.as_asgi()),
]
