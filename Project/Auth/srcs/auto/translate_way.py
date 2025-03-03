import requests

def get_translated_message(message_key, user_language):

	if user_language is None or user_language == "" or user_language not in ["tr", "en", "fr"]:
		user_language = "tr"
	headers = {"Accept-Language": user_language}

	try:
		response = requests.get(f"http://project-translation-1:8000/translation/{message_key}/", headers=headers)
		if response.status_code == 200:
			translations = response.json()
			return translations.get('message')
	except Exception as e:
		print(f"Translation service error [LOG]: {e}")
	return message_key + "(translate service dosent work, returned default message)"
