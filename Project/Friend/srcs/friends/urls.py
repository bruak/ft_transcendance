from django.urls import path
from .views import FriendRequestView
from .adminviews import FriendRequestAdminView

urlpatterns = [
	path("send_friend_request/", FriendRequestView.send_friend_request, name="send_friend_request"),
	path("list_friend_requests/<str:username>/", FriendRequestView.list_friend_requests, name="list_friend_requests"),
	path("accept_friend_request/", FriendRequestView.accept_friend_request, name="accept_friend_request"),
	path("block_friend/", FriendRequestView.block_friend, name="block_friend"),
	path("friends/<str:username>/", FriendRequestView.friends, name="friend"),
	path("reject_friend_request/", FriendRequestView.rejected_friend_request, name="reject_friend_request"),
	path("remove_friend/", FriendRequestView.remove_friend, name="remove_friend"),
	path("friend_list/", FriendRequestAdminView.friend_list, name="friend_list"),
]

