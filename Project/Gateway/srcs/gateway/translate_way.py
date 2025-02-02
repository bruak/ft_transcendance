import requests

def get_translated_message(message_key, user_language):

	if user_language is None or user_language == "" or user_language not in ["tr", "en", "fr"]:
		user_language = "tr"  # Default language is Turkish

	headers = {"Accept-Language": user_language}
	try:
		response = requests.get("http://project-translation-1:8000/get_translation_geteway/", headers=headers)
		print(response.status_code)
		if response.status_code == 200:
			translations = response.json()
			return translations.get(message_key, message_key)  # Çeviri yoksa orijinal mesajı dön
	except Exception as e:
		print(f"Translation service error [LOG]: {e}")  # Log için
	return message_key + "(translate service dosent work, returned default message)" # Hata olursa orijinal mesajı dön
