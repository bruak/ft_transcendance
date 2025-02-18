from django.urls import re_path
from game.consumers import PongConsumer, PongBotConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', PongConsumer.as_asgi()),
    re_path(r'ws/bot/(?P<room_name>\w+)/$', PongBotConsumer.as_asgi()),
]
