import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio

class PongConsumer(AsyncWebsocketConsumer):
    room_data = {}  # Her oda için oyuncu bilgilerini saklayacak bir yapı

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.groups = []
        self.game_loop_running = False
        self.game_state = None

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = self.room_name

        # Eğer oda için data yoksa, odayı başlat
        if self.room_name not in PongConsumer.room_data:
            PongConsumer.room_data[self.room_name] = {"host": None, "guest": None, "spectators": []}

        room_info = PongConsumer.room_data[self.room_name]

        # Oyun durumu her oda için özel
        self.game_state = {
            'players': {
                'player1': {'position': 0, 'score': 0},
                'player2': {'position': 0, 'score': 0},
            },
            'ball': {
                'x': 0.0,
                'y': 0.0,
                'z': 0.0,
                'vx': 0.1,
                'vy': 0.1,
                'vz': 0.0,
            }
        }

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Odaya gelen kullanıcıyı atanıyor
        if not room_info["host"]:
            room_info["host"] = self.channel_name
            self.player_id = 'player1'
        elif not room_info["guest"]:
            room_info["guest"] = self.channel_name
            self.player_id = 'player2'
            self.game_loop_running = True
            asyncio.create_task(self.start_game_loop())
        else:
            room_info["spectators"].append(self.channel_name)
            self.player_id = 'spectator'

        print(f"Oda: {self.room_name}, Kanal: {self.channel_name}, Rol: {self.player_id}")

        await self.send(json.dumps({
            'type': 'init',
            'state': self.game_state,
            'player_id': self.player_id
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        room_info = PongConsumer.room_data[self.room_name]

        # Kullanıcı rolüne göre çıkarılıyor
        if room_info["host"] == self.channel_name:
            room_info["host"] = None
        elif room_info["guest"] == self.channel_name:
            room_info["guest"] = None
            self.game_loop_running = False
        elif self.channel_name in room_info["spectators"]:
            room_info["spectators"].remove(self.channel_name)

        # Eğer oda boşsa, temizle
        if not room_info["host"] and not room_info["guest"] and not room_info["spectators"]:
            del PongConsumer.room_data[self.room_name]

    async def receive(self, text_data=None, bytes_data=None):
        if self.player_id == 'spectator':
            return
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'move':
            player_id = data.get('player_id')
            position_change = data.get('position_change', 0)
            if player_id in self.game_state['players'] and -4.5 <= self.game_state['players'][player_id]['position'] + position_change <= 4.5:
                self.game_state['players'][player_id]['position'] += position_change
            await self.broadcast_game_state()

    async def broadcast_game_state(self):
        await self.channel_layer.group_send(self.room_group_name,
            {
                "type": "game_states",
                "state": self.game_state
            }
        )

    async def game_states(self, event):
        await self.send(json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    def update_ball_position(self):
        ball = self.game_state['ball']
        ball['x'] += ball['vx']
        ball['y'] += ball['vy']

        if ball['x'] <= -10:
            ball['vx'] *= -1
        elif ball['x'] >= 10:
            ball['vx'] *= -1

        paddle1 = self.game_state['players']['player1']
        paddle2 = self.game_state['players']['player2']

        if ball['x'] <= -9 and paddle1['position'] - 2 <= ball['y'] <= paddle1['position'] + 2:
            ball['vx'] *= -1
        if ball['x'] >= 9 and paddle2['position'] - 2 <= ball['y'] <= paddle2['position'] + 2:
            ball['vx'] *= -1

        if abs(ball['y']) > 5:
            ball['vy'] *= -1
        if abs(ball['x']) > 10:
            ball['vx'] *= -1

        if ball['x'] < -10:
            self.game_state['players']['player2']['score'] += 1
            ball['x'], ball['y'] = 0.0, 0.0
        elif ball['x'] > 10:
            self.game_state['players']['player1']['score'] += 1
            ball['x'], ball['y'] = 0.0, 0.0

    async def start_game_loop(self):
        while self.game_loop_running:
            self.update_ball_position()
            await self.broadcast_game_state()
            await asyncio.sleep(1 / 60)
