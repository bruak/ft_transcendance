from django.urls import re_path
from .views import api_gateway

urlpatterns = [
    re_path(r'^(?P<path>.*)$', api_gateway),
]
