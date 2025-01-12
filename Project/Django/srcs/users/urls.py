from django.urls import path
from .views import UserViewSet, UserDeleteView

urlpatterns = [
    path('users/', UserViewSet.as_view(), name='users'),
    path('users/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
]