import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongGameState:
    def __init__(self):
        self.ball_x = 50
        self.ball_y = 50
        self.ball_vx = 1  # topun x hız yönü
        self.ball_vy = 1  # topun y hız yönü
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
            self.ball_vx *= -1  # geri yansıt

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
        # sinirlari asmasin
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
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"game_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.load(text_data)

    async def close_game(self, event):
        await self.close()
