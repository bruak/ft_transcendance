from django.urls import path
from .views import send_friend_request, list_friend_requests, accept_friend_request, block_friend, friends, rejected_friend_request, remove_friend, friend_list

urlpatterns = [
	path("send_friend_request/", send_friend_request, name="send_friend_request"),
	path("list_friend_requests/<str:username>/", list_friend_requests, name="list_friend_requests"),
	path("accept_friend_request/", accept_friend_request, name="accept_friend_request"),
	path("block_friend/", block_friend, name="block_friend"),
	path("friends/<str:username>/", friends, name="friend"),
	path("reject_friend_request/", rejected_friend_request, name="reject_friend_request"),
	path("remove_friend/", remove_friend, name="remove_friend"),
	path("friend_list/", friend_list, name="friend_list"),
]

