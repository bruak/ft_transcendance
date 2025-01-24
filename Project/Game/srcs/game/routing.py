from django.urls import path
from pong_app.consumers import PongConsumer

websocket_urlpatterns = [
    path('ws/pong/<str:room_name>/', PongConsumer.as_asgi()),
]
