from django.shortcuts import render
from .models import User
from .serializers import UserSerializer
from rest_framework import generics

from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt


def user_list(request):
	if request.method != "GET":
		return JsonResponse({"error": "Only GET method is allowed."}, status=405)
	try:
		obj = User.objects.all()
		serializer = UserSerializer(obj, many=True)
		return JsonResponse(serializer.data, safe=False)
	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def user_create(request):
	if request.method != "POST":
		return JsonResponse({"error": "Only POST method is allowed."}, status=405)
	try:
		data = JSONParser().parse(request)
		serializer = UserSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			return JsonResponse(serializer.data, status=201)
		return JsonResponse(serializer.errors, status=400)

	except Exception as e:
		return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def user_update(request, pk):
	if request.method == "PUT":
		try:
			user = User.objects.get(pk=pk)
			data = JSONParser().parse(request)
			serializer = UserSerializer(user, data=data)
			if (serializer.is_valid()):
				serializer.save()
				return (JsonResponse(serializer.data, status=200))
			return JsonResponse(serializer.errors, status=400)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	elif request.method == "GET" :
		try:
			user = User.objects.get(pk=pk)
			serializer = UserSerializer(user)
			return JsonResponse(serializer.data)
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)
	elif request.method == "DELETE":
		try:
			user = User.objects.get(pk=pk)
			user.delete()
			return (HttpResponse("user deleted, user name is " + user.username))
		except Exception as e:
			return JsonResponse({"error": str(e)}, status=500)



class UserViewSet(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class UserDeleteView(generics.RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer
