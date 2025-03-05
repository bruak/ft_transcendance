
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from asgiref.sync import sync_to_async
from django.utils import timezone
from abc import ABC, abstractmethod
import random
from game.models import Match, Tournament
from time import time
import requests
from django.conf import settings
import redis

redis_client = redis.StrictRedis(
    host=getattr(settings, "REDIS_HOST", "redis"),
    port=getattr(settings, "REDIS_PORT", 6379),
    db=0
)

class BasePongConsumer(AsyncWebsocketConsumer, ABC):
	room_data = {}
	position_change = 0.2
	ball_speed = 1

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.groups = []
		self.speed_timer = 0
		self.player_id = None

	async def update_match_status(self, new_status):
		self.match.status = new_status
		self.match.updated_at = timezone.now()
		await sync_to_async(self.match.save)()

		try:
			response = requests.post('http://notification:8000/create/', json={"message": "recent_activities"})
			response.raise_for_status()
		except requests.RequestException as e:
			print(f"Error sending notification: {e}")
		
	async def save_match_data(self, winner):
		try:
			score = f"{self.game_state['players']['player1']['score']}:{self.game_state['players']['player2']['score']}"
			self.match.status = "finished"
			self.match.score = score
			self.match.winner = self.match.player1 if winner == "player1" else self.match.player2
			self.match.updated_at = timezone.now()
			await sync_to_async(self.match.save)()
			await self.broadcast_game_status("game_over")
			if self.match.match_type == 'T':
				await self.handle_tournament_progression()
		except Exception as e:
			print(f"Error saving match data: {e}")

	async def handle_tournament_progression(self):
		tournament = await sync_to_async(lambda: self.match.tournament)()
		
		current_winner = self.match.winner
		match_count = await sync_to_async(Match.objects.filter(tournament=tournament, status="finished").count)()
		if int(match_count) == int(tournament.player_limit - 1):
			tournament.status = "finished"
			tournament.winner = current_winner
			tournament.updated_at = timezone.now()
			await sync_to_async(tournament.save)()
			return
		waiting_match_qs = await sync_to_async(lambda: Match.objects.filter(
			tournament=tournament,
			status='waiting',
			player2__isnull=True
		))()
		waiting_match = await sync_to_async(lambda qs: qs.first())(waiting_match_qs)
		
		if waiting_match:
			waiting_match.player2 = current_winner
			waiting_match.updated_at = timezone.now()
			await sync_to_async(waiting_match.save)()
		else:
			await sync_to_async(Match.objects.create)(
				tournament=tournament,
				match_type='T',
				player1=current_winner,
				player2=None,
				status='waiting'
			)


	def create_initial_game_state(self):
		return {
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

	async def connect(self):
		self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
		self.room_group_name = self.room_name

		if self.room_name not in self.room_data:
			self.room_data[self.room_name] = {
				"host": None,
				"guest": None,
				"spectators": [],
				"game_state": self.create_initial_game_state(),
				"game_loop_running": False,
				"game_finished": False
			}

		room_info = self.room_data[self.room_name]
		self.game_state = room_info["game_state"]
		
		match_id = int(self.room_name.split("_")[1])
		self.match = await sync_to_async(Match.objects.get)(id=match_id)
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		redis_client.sadd("online_users", self.scope["user"].username)
		await self.accept()

		await self.handle_player_connection(room_info)

	@abstractmethod
	async def handle_player_connection(self, room_info):
		pass

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		redis_client.srem("online_users", self.scope["user"].username)

		if self.room_name in self.room_data:
			room_info = self.room_data[self.room_name]

			if room_info["host"] == self.channel_name:
				room_info["host"] = 'disconnected'
			elif room_info["guest"] == self.channel_name:
				room_info["guest"] = 'disconnected'
			elif self.channel_name in room_info["spectators"]:
				room_info["spectators"].remove(self.channel_name)

			if room_info["game_loop_running"] and self.player_id in ['player1', 'player2']:
				winner = "player2" if self.player_id == "player1" else "player1"
				await self.save_match_data(winner)
				room_info["game_loop_running"] = False
				room_info["game_finished"] = True
			elif self.player_id in ['player1', 'player2'] and room_info["game_finished"] == False and room_info["game_loop_running"] == False:
				await self.update_match_status("canceled")

			if room_info["host"] == 'disconnected' and room_info["guest"] == 'disconnected' and not room_info["spectators"] and self.room_name in self.room_data:
				del self.room_data[self.room_name]


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
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				"type": "game_states",
				"state": self.game_state
			}
		)
	async def broadcast_game_status(self, status):
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				"type": "game_status",
				"status": status
			}
		)

	async def game_states(self, event):
		await self.send(json.dumps({
			'type': 'game_state',
			'state': event['state']
		}))

	async def game_status(self, event):
		await self.send(json.dumps({
			'type': 'game_status',
			'status': event['status']
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

		if abs(ball['y']) > 3.5:
			ball['vy'] *= -1
		if abs(ball['x']) > 7:
			ball['vx'] *= -1

		paddle1 = self.game_state['players']['player1']
		paddle2 = self.game_state['players']['player2']
		if ball['x'] <= -6 and paddle1['position'] - 1 <= ball['y'] <= paddle1['position'] + 1 and ball['vx'] < 0:
			ball['vx'] *= -1
			self.ball_speed *= 1.04
		if ball['x'] >= 6 and paddle2['position'] - 1 <= ball['y'] <= paddle2['position'] + 1 and ball['vx'] > 0:
			ball['vx'] *= -1
			self.ball_speed *= 1.04
		if ball['x'] < -6.7:
			self.game_state['players']['player2']['score'] += 1
			ball['x'], ball['y'] = 0.0, 0.0
			self.ball_speed = 1
		elif ball['x'] > 6.7:
			self.game_state['players']['player1']['score'] += 1
			ball['x'], ball['y'] = 0.0, 0.0
			self.ball_speed = 1

	async def start_game_loop(self):
		room_info = self.room_data[self.room_name]
		if room_info["game_loop_running"]:
			return

		room_info["game_loop_running"] = True
		try:
			p1 = room_info['game_state']['players']['player1']
			p2 = room_info['game_state']['players']['player2']
			while room_info["game_loop_running"]:
				self.update_paddle_positions()
				self.update_ball_position()
				if p2['score'] >= 5 or p1['score'] >= 5:
					winner = "player1" if p1['score'] > p2['score'] else "player2"
					room_info["game_finished"] = True
					room_info["game_loop_running"] = False
					await self.save_match_data(winner)
					break

				await self.broadcast_game_state()
				await asyncio.sleep(1 / 60)
		finally:
			room_info["game_loop_running"] = False

class PongConsumer(BasePongConsumer):
	async def handle_player_connection(self, room_info):
		if self.scope['user'].username == self.match.player1:
			room_info["host"] = self.channel_name
			self.player_id = 'player1'
		elif self.match.player2 and self.scope['user'].username == self.match.player2:
			room_info["guest"] = self.channel_name
			self.player_id = 'player2'
		else:
			room_info["spectators"].append(self.channel_name)
			self.player_id = 'spectator'

		if room_info["host"] and room_info["guest"] and not room_info["game_loop_running"]:
			await self.broadcast_game_status("start")
			await self.update_match_status("playing")
			asyncio.create_task(self.start_game_loop())

class PongBotConsumer(BasePongConsumer):
	async def handle_player_connection(self, room_info):
		if self.scope['user'].username == self.match.player1:
			room_info["host"] = self.channel_name
			self.player_id = 'player1'
			if not room_info["game_loop_running"]:
				await self.update_match_status("playing")
				asyncio.create_task(self.start_game_loop())
				asyncio.create_task(self.bot_loop())
		else:
			room_info["spectators"].append(self.channel_name)
			self.player_id = 'spectator'
		await self.broadcast_game_status("start")


	async def bot_loop(self):
		bot_id = "player2" if self.player_id == "player1" else "player1"
		room_info = self.room_data[self.room_name]
		while room_info["game_loop_running"]:
			ball = self.game_state['ball']
			bot_position = self.game_state['players'][bot_id]['position']

			error_chance = random.random()
			if ball['x'] > 0 and ball['vx'] > 0:
				if error_chance < 0.15:
					if ball['y'] > bot_position + 0.4:
						self.game_state['players'][bot_id]['move_up'] = False
						self.game_state['players'][bot_id]['move_down'] = True
					elif ball['y'] < bot_position - 0.4:
						self.game_state['players'][bot_id]['move_up'] = True
						self.game_state['players'][bot_id]['move_down'] = False
					else:
						self.game_state['players'][bot_id]['move_up'] = False
						self.game_state['players'][bot_id]['move_down'] = False
			else:
				self.game_state['players'][bot_id]['move_up'] = False
				self.game_state['players'][bot_id]['move_down'] = False

			await asyncio.sleep(1 / 60)

class LocalPongConsumer(BasePongConsumer):
	async def handle_player_connection(self, room_info):
		room_info["host"] = self.channel_name
		room_info["guest"] = self.channel_name
		self.player_id = 'local'
		
		await self.broadcast_game_status("start")
		
		if not room_info["game_loop_running"]:
			await self.update_match_status("playing")
			asyncio.create_task(self.start_game_loop())

	async def receive(self, text_data=None, bytes_data=None):
		data = json.loads(text_data)
		message_type = data.get('type')

		if message_type == 'move':
			player = data.get('player')
			move_up = data.get('move_up', False)
			move_down = data.get('move_down', False)
			if player in self.game_state['players']:
				self.game_state['players'][player]['move_up'] = move_up
				self.game_state['players'][player]['move_down'] = move_down
