from django.urls import re_path
from notification.consumers import NotifConsumer

websocket_urlpatterns = [
    re_path(r'ws/notification/$', NotifConsumer.as_asgi()),
]
