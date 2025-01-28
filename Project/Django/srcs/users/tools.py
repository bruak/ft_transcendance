from .models import User
from django.core.files.storage import default_storage
import os, requests
from django.core.files.base import ContentFile


def username_check(username):
	return User.objects.filter(username=username).exists()

def image_to_url(avatar):
	if avatar:
		avatar_url = default_storage.save('avatars/' + avatar.name, avatar)
		avatar_url = default_storage.url(avatar_url)
	else:
		avatar_url = User._meta.get_field('avatar').default
	return (avatar_url)

def image_intra_create(avatar_url):
	response = requests.get(avatar_url)
	response.raise_for_status()  # Eğer istekte hata olursa, bunu yakala
	filename = os.path.basename(avatar_url)
	# Dosya kaydetme işlemi için file_path oluşturuluyor
	file_path = 'avatars/' + filename  # Kaydedilecek dosyanın yol
	# İndirilen dosya içeriği
	avatar_file = ContentFile(response.content)
	# Dosyayı kaydet ve dosya yolunu al
	file_path = default_storage.save(file_path, avatar_file)
	# Kaydedilen dosyanın URL'sini al
	avatar_url = default_storage.url(file_path)
	return avatar_url
