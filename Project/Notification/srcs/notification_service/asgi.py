import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from notification.routing import websocket_urlpatterns
from notification.middleware import NotificationMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notification_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": NotificationMiddleware(URLRouter(websocket_urlpatterns)),
})
