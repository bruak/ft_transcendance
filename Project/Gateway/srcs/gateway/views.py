import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from .translate_way import get_translated_message

@csrf_exempt
def handle_post(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path  # Path middleware'den gelir
	if request.content_type == "application/json":
		payload = JSONParser().parse(request)
	else:
		payload = None  # Byte'ı string'e çeviriyoruz
	try:
		headers = request.headers
		response = requests.post(target_url, json=payload, headers=headers)
		# Yanıtın boş olup olmadığını kontrol et
		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("Empty response from target URL", user_language)}, status=500)
		# Yanıtı JSON olarak çözümle
		response_json = response.json()

		if response.status_code == 200 or response.status_code == 201:
			return JsonResponse({'message': get_translated_message("Request was successful", user_language), 'data': response_json}, status=response.status_code)
		else:
			return JsonResponse({'error': get_translated_message("Request failed", user_language), 'status_code': response.status_code, 'data': response_json}, status=response.status_code)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def handle_get(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path
	try:
		headers = request.headers
		response = requests.get(target_url, headers=headers)
		print(f"url {target_url}")
		if response.status_code != 200:
			return JsonResponse({'error': get_translated_message("Request failed", user_language), 'status_code': response.status_code, 'data': response.json()}, status=response.status_code)
		# Yanıtın boş olup olmadığını kontrol et
		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("Empty response from target URL", user_language)}, status=500)
		# Yanıtı JSON olarak çözümle
		try:
			response_json = response.json()
		except ValueError:
			return JsonResponse({'error': get_translated_message("Invalid JSON response", user_language), 'details': response.text}, status=500)

		return JsonResponse({'message': get_translated_message("Request was successful", user_language), 'data': response_json}, status=response.status_code)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)

def handle_formdata(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path  # Path middleware'den gelir
	try:
		files = request.FILES
		payload = request.POST
		response = requests.post(target_url, data=payload, files=files)
		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("Empty response from target URL", user_language)}, status=500)
		response_json = response.json()
		if response.status_code == 200 or response.status_code == 201:
			return JsonResponse({'message': get_translated_message("Request was successful", user_language), 'data': response_json}, status=response.status_code)
		else:
			return JsonResponse({'message': get_translated_message("Request failed", user_language), 'status_code': response.status_code}, status=500)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt  # CSRF kontrolü atlanacak
def api_gateway(request, *args, **kwargs):
	if request.method == 'POST' and request.FILES:
		return handle_formdata(request)
	elif request.method == 'POST':
		return handle_post(request)
	elif request.method == 'GET':
		return handle_get(request)
	else:
		return JsonResponse({'error': 'Method not allowed'}, status=405)
