from django.shortcuts import render
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.parsers import JSONParser

# Create your views here.
@csrf_exempt
def notification_create(request):
	if request.method == 'POST':
		try:
			data = JSONParser().parse(request)
			message = data.get('message', 'No message provided')
			channel_layer = get_channel_layer()
			async_to_sync(channel_layer.group_send)(
				'notification',  # WebSocket kanalına mesaj gönderiyoruz
				{
					'type': 'send_notification',  # Consumer içinde bu metodu tetikleyecek
					'message': message
				}
			)
			return JsonResponse({'status': 'success', 'message': message})
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
