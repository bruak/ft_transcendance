from django.shortcuts import render
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
from .translate_way import get_translated_message
from django.conf import settings
import redis
import requests

redis_client = redis.StrictRedis(
    host=getattr(settings, "REDIS_HOST", "redis"),
    port=getattr(settings, "REDIS_PORT", 6379),
    db=0
)

@csrf_exempt
def notification_create(request):
    if request.method != 'POST':
        return JsonResponse({'error', get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)

    try:
        data = JSONParser().parse(request)
        message = data.get('message', 'No message provided')
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'notification',
            {
                'type': 'send_notification',
                'message': message
            }
        )
        return JsonResponse('message', get_translated_message("SUCCESSFULL", user_language), status=201)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'error', get_translate_message("UNKNOWN_ERROR", user_language)}, status=500)

@csrf_exempt
def online_users_view(request):
    if request.method != 'GET':
        return JsonResponse({'error', get_translated_message("ONLY_GET_REQUESTS_ALLOWED", user_language)}, status=405)
    try:
        active_user_ids = redis_client.smembers("online_users")
        return JsonResponse({'message': [user_id.decode('utf-8') for user_id in active_user_ids]}, status=200)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})

