import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from django.utils import timezone

from game.models import Match 
class PongConsumer(AsyncWebsocketConsumer):
    room_data = {} 
    position_change = 0.2
    ball_speed = 1
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.groups = []
        self.game_loop_running = False
        self.speed_timer = 0

    async def save_match_data(self, winner):
        match_id = int(self.room_name.split("_")[1])
        room_info = PongConsumer.room_data[self.room_name]
        score = f"{self.game_state['players']['player1']['score']}:{self.game_state['players']['player2']['score']}"  # Skor formatı

        winner_name = "player1" if winner == "player1" else "player2"
        await sync_to_async(Match.objects.filter(id=match_id).update)(
            status="finished",
            score=score,
            winner=winner_name,
            updated_at=timezone.now(),
        )

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = self.room_name

        if self.room_name not in PongConsumer.room_data:
            PongConsumer.room_data[self.room_name] = {
                "host": None,
                "guest": None,
                "spectators": [],
                "game_state": {
                    'players': {
                        'player1': {'position': 0, 'score': 0, 'move_up': False, 'move_down': False},
                        'player2': {'position': 0, 'score': 0, 'move_up': False, 'move_down': False},
                    },
                    'ball': {
                        'x': 0.0,
                        'y': 0.0,
                        'vx': 0.1,
                        'vy': 0.1,
                    }
                }
            }

        room_info = PongConsumer.room_data[self.room_name]
        self.game_state = room_info["game_state"]

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        if not room_info["host"]:
            room_info["host"] = self.channel_name
            self.player_id = 'player1'
        elif not room_info["guest"]:
            room_info["guest"] = self.channel_name
            self.player_id = 'player2'
            await  asyncio.sleep(1)
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

        if room_info["host"] == self.channel_name:
            room_info["host"] = None
        elif room_info["guest"] == self.channel_name:
            room_info["guest"] = None
            self.game_loop_running = False
        elif self.channel_name in room_info["spectators"]:
            room_info["spectators"].remove(self.channel_name)

        if not room_info["host"] and not room_info["guest"] and not room_info["spectators"]:
            del PongConsumer.room_data[self.room_name]

    async def receive(self, text_data=None, bytes_data=None):
        if self.player_id == 'spectator':
            return
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'move':
            move_up = data.get('move_up', False)
            move_down = data.get('move_down', False)
            if self.player_id in self.game_state['players']:
                self.game_state['players'][self.player_id]['move_up'] = move_up
                self.game_state['players'][self.player_id]['move_down'] = move_down

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

    def update_paddle_positions(self):
        for player_id in ['player1', 'player2']:
            player = self.game_state['players'][player_id]
            if player['move_up'] and player['position'] > -3:
                player['position'] -= self.position_change
            if player['move_down'] and player['position'] < 3:
                player['position'] += self.position_change

    def update_ball_position(self):
        ball = self.game_state['ball']
        ball['x'] += ball['vx'] * self.ball_speed
        ball['y'] += ball['vy'] * self.ball_speed

        if ball['x'] <= -10:
            ball['vx'] *= -1
        elif ball['x'] >= 10:
            ball['vx'] *= -1

        paddle1 = self.game_state['players']['player1']
        paddle2 = self.game_state['players']['player2']
        if ball['x'] <= -6 and paddle1['position'] - 1 <= ball['y'] <= paddle1['position'] + 1 and ball['vx'] < 0:
            ball['vx'] *= -1
        if ball['x'] >= 6 and paddle2['position'] - 1 <= ball['y'] <= paddle2['position'] + 1 and ball['vx'] > 0:
            ball['vx'] *= -1

        if abs(ball['y']) > 3.5:
            ball['vy'] *= -1
        if abs(ball['x']) > 7:
            ball['vx'] *= -1

        if ball['x'] < -6.3:
            self.game_state['players']['player2']['score'] += 1
            ball['x'], ball['y'] = 0.0, 0.0
            self.ball_speed = 1
        elif ball['x'] > 6.3:
            self.game_state['players']['player1']['score'] += 1
            ball['x'], ball['y'] = 0.0, 0.0
            self.ball_speed = 1

    async def start_game_loop(self):
        p1 = self.game_state['players']['player1']
        p2 = self.game_state['players']['player2']
        while self.game_loop_running:
            self.update_paddle_positions()
            self.update_ball_position()
            self.speed_timer += 1 / 60
            if self.speed_timer >= 10:
                self.ball_speed *= 1.05
                self.speed_timer = 0
            if p2['score'] >= 5 or p1['score'] >= 5:
                winner = "player1" if p1['score'] > p2['score'] else "player2"
                await self.save_match_data(winner)
                self.game_loop_running = False
            await self.broadcast_game_state()
            await asyncio.sleep(1 / 60)
