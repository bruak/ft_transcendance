from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import requests

# Servislerin URL'lerini tanımlayalım
SERVICES = {
    "auth": "http://auth:8000/",
    "user": "http://users:8000",
    "game": "http://game:8000",
    "mail": "http://mail:8000",
    "friend": "http://friend:8000",
}

class APIGatewayView(APIView):

	def s(self, request, service_name, *args, **kwargs):
		print("a")
