import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import GameSatats
from .serializer import GameSatatsSerializer

class PongConsumer(AsyncWebsocketConsumer):
    game_state = {
        'players': {
            'player1': {'position': 0, 'score': 0},
            'player2': {'position': 0, 'score': 0},
        },
        'ball': {
            'x': 0.0,
            'y': 0.0,
            'z': 0.0,
            'vx': 0.1,  # hız vektörü x
            'vy': 0.1,  # hız vektörü y
            'vz': 0.0,  # 2D Pong için z eksenini isterseniz sabit tutabilirsiniz
        }
    }
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"game_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Determine if the player is host or guest
        if not hasattr(self.channel_layer, 'host'):
            self.channel_layer.host = self.channel_name
            self.player_id = 'player1'
        elif not hasattr(self.channel_layer, 'guest'):
            self.channel_layer.guest = self.channel_name
            self.player_id = 'player2'
        else:
            self.player_id = 'spectator'

        await self.send(json.dumps({
            'type': 'init',
            'state': self.game_state,
            'player_id': self.player_id
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.channel_name == getattr(self.channel_layer, 'host', None):
            del self.channel_layer.host
        elif self.channel_name == getattr(self.channel_layer, 'guest', None):
            del self.channel_layer.guest

    async def receive(self, text_data=None, bytes_data=None):
        if self.player_id == 'spectator':
            return  # Read-only permission for spectators

        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'move':  # oyuncu raketi hareket ettiriyor
            player_id = data.get('player_id')
            position_change = data.get('position_change', 0)
            if player_id in self.game_state['players']:
                # örnek olarak y ekseninde kaydırma
                self.game_state['players'][player_id]['position'] += position_change

            # Her hareketten sonra yeni durumu tüm kullanıcılara yayınla
            await self.broadcast_game_state()

        elif message_type == 'update_ball':
            self.update_ball_position()
            await self.broadcast_game_state()

            

    async def broadcast_game_state(self):
        # Mevcut tüm bağlantılara güncel oyun durumunu gönder
        await self.channel_layer.group_send(self.room_group_name,
            {
                "type": "game_states",
                "state": self.game_state
            }
        )

    async def game_states(self, event):
        # group_send ile gelen veriyi WebSocket'e gönderme
        await self.send(json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    async def update_ball_position(self):
        # Fizik hesaplaması (basit sekme mantığı vb.) örneği:
        ball = self.game_state['ball']
        ball['x'] += ball['vx']
        ball['y'] += ball['vy']

        # Duvarlara çarpma kontrolü (basit 2D örnek)
        if abs(ball['y']) > 5:  # yukarı/aşağı sınırı aştı varsayalım
            ball['vy'] *= -1
        if abs(ball['x']) > 10:  # sol/sağ sınırı aştı varsayalım
            ball['vx'] *= -1
        # Rakete çarpışma vs. ek lojik eklenebilir.

        # Skor güncellemesi (topun x, -x sınırlarını geçmesi gibi durumlarda)
        if ball['x'] < -10:
            self.game_state['players']['player2']['score'] += 1
            # topu ortada yeniden başlat
            ball['x'], ball['y'] = 0.0, 0.0
        elif ball['x'] > 10:
            self.game_state['players']['player1']['score'] += 1
            # topu ortada yeniden başlat
            ball['x'], ball['y'] = 0.0, 0.0
