from django.urls import path
from .views import send_friend_request, list_friend_requests, accept_friend_request, block_friend, friends

urlpatterns = [
	path("send_friend_request/", send_friend_request, name="send_friend_request"),
	path("list_friend_requests/<str:username>/", list_friend_requests, name="list_friend_requests"),
	path("accept_friend_request/", accept_friend_request, name="accept_friend_request"),
	path("block_friend/", block_friend, name="block_friend"),
	path("friends/<str:username>/", friends, name="friend"),
]

