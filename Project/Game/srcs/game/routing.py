from django.urls import re_path
from game.consumers import PongConsumer, PongBotConsumer, LocalPongConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', PongConsumer.as_asgi()),
    re_path(r'ws/bot/(?P<room_name>\w+)/$', PongBotConsumer.as_asgi()),
    re_path(r'ws/local/(?P<room_name>\w+)/$', LocalPongConsumer.as_asgi()),
]
