import requests
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from .translate_way import get_translated_message
import json
from django.http import JsonResponse

@csrf_exempt
def handle_post(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path
	if request.content_type == "application/json":
		if not request.body:
			return JsonResponse({'error': get_translated_message("EMPTY_REQUEST_BODY", user_language)}, status=500)
		try:
			payload = JSONParser().parse(request)
		except Exception as e:
			return JsonResponse({'error': get_translated_message("INVALID_JSON_REQUEST_BODY", user_language)}, status=500)
	else:
		payload = None
	try:
		headers = request.headers
		response = requests.post(target_url, json=payload, headers=headers)

		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("EMPTY_RESPONSE_TARGET_URL", user_language)}, status=500)
	
		response_json = response.json()

		if response.status_code == 200 or response.status_code == 201:
			return JsonResponse({'message': get_translated_message("REQUEST_SUCCESSFUL", user_language), 'data': response_json}, status=response.status_code)
		else:
			return JsonResponse({'error': get_translated_message("REQUEST_FAILED", user_language), 'status_code': response.status_code, 'data': response_json}, status=response.status_code)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)

def handle_delete(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path
	try:
		headers = {"Accept-Language": request.headers.get("Accept-Language", "tr"), "Authorization" : request.headers.get("Authorization", None)} 
		response = requests.delete(target_url, headers=headers)

		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("EMPTY_RESPONSE_TARGET_URL", user_language)}, status=500)

		response_json = response.json()

		if response.status_code == 200 or response.status_code == 204:
			return JsonResponse({'message': get_translated_message("REQUEST_SUCCESSFUL", user_language), 'data': response_json}, status=response.status_code)
		else:
			return JsonResponse({'error': get_translated_message("REQUEST_FAILED", user_language), 'status_code': response.status_code, 'data': response_json}, status=response.status_code)
		
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)
	
@csrf_exempt
def handle_get(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path
	try:
		headers = {"Accept-Language": request.headers.get("Accept-Language", "tr"), "Authorization" : request.headers.get("Authorization", None)} 
		response = requests.get(target_url, headers=headers)
		if response.status_code not in (200, 201):
			return JsonResponse({'error': get_translated_message("REQUEST_FAILED", user_language), 'status_code': response.status_code, 'data': response.json()}, status=response.status_code)

		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("EMPTY_RESPONSE_TARGET_URL", user_language)}, status=500)

		try:
			response_json = response.json()
			if response_json.get('url') is not None:
				return JsonResponse({'message': response_json}, status=response.status_code)
		except ValueError:
			return JsonResponse({'error': get_translated_message("INVALID_JSON_RESPONSE", user_language), 'DETAILS': response.text}, status=500)
		return JsonResponse({'message': get_translated_message("REQUEST_SUCCESSFUL", user_language), 'data': response_json.get('message')}, status=response.status_code)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)

def handle_formdata(request):
	user_language = request.headers.get("Accept-Language", "tr")
	target_url = request.path
	try:
		files = None
		if request.FILES:
			files = request.FILES
		payload = request.POST
		headers = {"Accept-Language": request.headers.get("Accept-Language", "tr"), "Authorization" : request.headers.get("Authorization", None)} 
		if request.FILES:
			response = requests.post(target_url, data=payload, files=files, headers=headers)
		else:
			response = requests.post(target_url, data=payload, headers=headers)
		
		if response.text.strip() == '':
			return JsonResponse({'error': get_translated_message("EMPTY_RESPONSE_TARGET_URL", user_language)}, status=500)
		response_json = response.json()
		if response.status_code == 200 or response.status_code == 201:
			return JsonResponse({'message': get_translated_message("REQUEST_SUCCESSFUL", user_language), 'data': response_json}, status=response.status_code)
		else:
			return JsonResponse({'message': get_translated_message("REQUEST_FAILED", user_language), 'status_code': response.status_code, 'response_json': response_json}, status=500)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def api_gateway(request, *args, **kwargs):
	if request.method == 'POST' and request.content_type == 'multipart/form-data':
		return handle_formdata(request)
	elif request.method == 'POST':
		return handle_post(request)
	elif request.method == 'GET':
		return handle_get(request)
	elif request.method == 'DELETE':
		return handle_delete(request) 
	else:
		return JsonResponse({'error': 'Method not allowed'}, status=405)
