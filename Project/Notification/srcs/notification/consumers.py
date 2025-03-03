import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async

class NotifConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("notification", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notification", self.channel_name)

    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'message': message}))
