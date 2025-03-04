
from datetime import timedelta
from django.utils import timezone
import jwt

refresh_secret_key = "test_refresh_secret_1234abcd5678efgh"
access_secret_key = "test_access_secret_5678ijkl9012mnop"

class TokenService:

	@staticmethod
	def generate_access_token(username):
		exp = TokenService.create_expiration_date(60 * 24 * 365)
		RoleGuard = "User"
		if (username == "albozkur" or username == "bsoykan" or username == "tkurukay" or username == "idelemen"):
			RoleGuard = "Admin"
		access_token = jwt.encode(
			{"username": username, "exp": exp, "RoleGuard": RoleGuard}, access_secret_key, algorithm="HS256"
		)
		return access_token, exp	

	@staticmethod
	def generate_refresh_token(username):
		exp = TokenService.create_expiration_date(60 * 24 * 365)
		RoleGuard = "User"
		if (username == "albozkur"):
			RoleGuard = "Admin"
		refresh_token = jwt.encode(
			{"username": username, "exp": exp, "RoleGuard": RoleGuard},
			refresh_secret_key,
			algorithm="HS256",
		)
		return refresh_token, exp

	@staticmethod
	def create_expiration_date(minutes):
		return timezone.now() + timedelta(minutes=minutes)

	@staticmethod
	def validate_access_token(access_token):
		try:
			decoded_token = jwt.decode(
				access_token, access_secret_key, algorithms=["HS256"]
			)
			return decoded_token["username"]
		except jwt.ExpiredSignatureError:
			return None, "Access token expired"
		except jwt.InvalidTokenError:
			return None, "Invalid access token"

	@staticmethod
	def validate_refresh_token(refresh_token):
		try:
			decoded_token = jwt.decode(
				refresh_token, refresh_secret_key, algorithms=["HS256"]
			)
			return decoded_token["username"]
		except jwt.ExpiredSignatureError:
			return None, "Refresh token expired"
		except jwt.InvalidTokenError:
			return None, "Invalid refresh token"

	def is_mail_token_expired(exp):
		return timezone.now() > exp
	
	def is_admin(access_token):
		try:
			decoded_token = jwt.decode(
				access_token, access_secret_key, algorithms=["HS256"]
			)
			role = decoded_token.get("RoleGuard", "User")
			if role == "Admin":
				return True
			return False
		except jwt.ExpiredSignatureError:
			return False, "Refresh token expired"
		except jwt.InvalidTokenError:
			return False, "Invalid refresh token"

