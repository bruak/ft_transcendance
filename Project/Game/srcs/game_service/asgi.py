import os
import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "game_service.settings")
django.setup()
from game.routing import websocket_urlpatterns
from game.middleware import GameWSAuthMiddleware
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": GameWSAuthMiddleware(URLRouter(websocket_urlpatterns)),
})
