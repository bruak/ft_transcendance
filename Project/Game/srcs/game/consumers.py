
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class PongGameState:
    def __init__(self):
        self.ball_x = 50
        self.ball_y = 50
        self.paddle_left_y = 50
        self.paddle_right_y = 50
        self.score_left = 0
        self.score_right = 0
        self.width = 100
        self.height = 100
    
    def update(self):
        self.ball_x += self.ball_vx
        self.ball_y += self.ball_vy

        if self.ball_y <= 0 or self.ball_y >= self.height:
            self.ball_vy *= -1

        if self.ball_x <= 0:
            self.score_right += 1
            self.reset_ball(direction='right')

        if self.ball_x >= self.width:
            self.score_left += 1
            self.reset_ball(direction='left')

        paddle_half_size = 10
        if self.ball_x <= 5 and (self.paddle_left_y - paddle_half_size <= self.ball_y <= self.paddle_left_y + paddle_half_size):

        if self.ball_x >= self.width - 5 and (self.paddle_right_y - paddle_half_size <= self.ball_y <= self.paddle_right_y + paddle_half_size):
            self.ball_vx *= -1

    def reset_ball(self, direction='right'):
        self.ball_x = self.width // 2
        self.ball_y = self.height // 2
        if direction == 'right':
            self.ball_vx = 1
        else:
            self.ball_vx = -1
        self.ball_vy = 1

    def move_paddle_left(self, dy):
        self.paddle_left_y += dy
        self.paddle_left_y = max(0, min(self.height, self.paddle_left_y))

    def move_paddle_right(self, dy):
        self.paddle_right_y += dy
        self.paddle_right_y = max(0, min(self.height, self.paddle_right_y))

    def serialize(self):
        return {
            "ball_x": self.ball_x,
            "ball_y": self.ball_y,
            "paddle_left_y": self.paddle_left_y,
            "paddle_right_y": self.paddle_right_y,
            "score_left": self.score_left,
            "score_right": self.score_right,
        }

class PongConsumer(AsyncWebsocketConsumer):
    group_name = "pong_room"

    game_state = PongGameState()

    game_loop_started = False

    async def connect(self):
        await self.accept()

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        if not self.__class__.game_loop_started:
            self.__class__.game_loop_started = True
            asyncio.create_task(self.game_loop())

        await self.send(text_data=json.dumps({
            "type": "init",
            "state": self.__class__.game_state.serialize()
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "move_left":
            dy = data.get("dy", 0)
            self.__class__.game_state.move_paddle_left(dy)
        elif action == "move_right":
            dy = data.get("dy", 0)
            self.__class__.game_state.move_paddle_right(dy)

        await self.channel_layer.group_send(self.group_name, {
            "type": "broadcast_state"
        })

    async def broadcast_state(self, event):

        await self.send(text_data=json.dumps({
            "type": "state",
            "state": self.__class__.game_state.serialize()
        }))

    async def game_loop(self):
        while True:
            self.__class__.game_state.update()

            await self.channel_layer.group_send(self.group_name, {
                "type": "broadcast_state",
            })

            await asyncio.sleep(0.05)
