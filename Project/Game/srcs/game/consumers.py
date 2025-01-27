import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"pong_{self.room_name}"

        # Odaya katıl
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Odadan çık
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # İstemciden gelen mesajı işle
        data = json.loads(text_data)

        # Mesaj türünü kontrol et
        if data['type'] == 'move':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_move',
                    'player': data['player'],
                    'position': data['position']
                }
            )
        elif data['type'] == 'ball_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_position',
                    'ball': data['ball']
                }
            )

    async def player_move(self, event):
        # Oyuncunun hareketini diğer oyuncuya gönder
        await self.send(text_data=json.dumps({
            'type': 'move',
            'player': event['player'],
            'position': event['position']
        }))

    async def ball_position(self, event):
        # Topun pozisyonunu istemcilere gönder
        await self.send(text_data=json.dumps({
            'type': 'ball',
            'ball': event['ball']
        }))
