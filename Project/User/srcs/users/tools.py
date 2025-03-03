from .models import User
from django.core.files.storage import default_storage
import os, requests
from django.core.files.base import ContentFile


def username_check(username):
	return User.objects.filter(username=username).exists()

def image_to_url(avatar, username):
    if avatar:
        file_extension = os.path.splitext(avatar.name)[1]
        new_filename = f"{username}{file_extension}"
        avatar.name = new_filename
        avatar_url = default_storage.save('avatars/' + avatar.name, avatar)
        avatar_url = default_storage.url(avatar_url)
    else:
        avatar_url = User._meta.get_field('avatar').default
    return avatar_url

def image_intra_create(avatar_url):
	response = requests.get(avatar_url)
	response.raise_for_status()
	filename = os.path.basename(avatar_url)
	file_path = 'avatars/' + filename
	avatar_file = ContentFile(response.content)
	file_path = default_storage.save(file_path, avatar_file)
	avatar_url = default_storage.url(file_path)
	return avatar_url
