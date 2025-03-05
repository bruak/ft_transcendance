import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from django.conf import settings
import redis

redis_client = redis.StrictRedis(
host=getattr(settings, "REDIS_HOST", "redis"),
port=getattr(settings, "REDIS_PORT", 6379),
db=0
)

class NotifConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("notification", self.channel_name)
        redis_client.sadd("online_users", self.scope["user"].username)
        await self.accept()

    async def disconnect(self, close_code):
        redis_client.srem("online_users", self.scope["user"].username)
        await self.channel_layer.group_discard("notification", self.channel_name)
        
    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'message': message}))
