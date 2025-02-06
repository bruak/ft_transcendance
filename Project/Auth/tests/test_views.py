from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.hashers import make_password
from auto.models import Users, TwofactorCodes, MailTokens
from unittest.mock import patch
import json

class AuthViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = Users.objects.create(
            username="testuser",
            email="testuser@example.com",
            password=make_password("testpassword")
        )
        self.singin_url = reverse('singin')
        self.singup_url = reverse('singup')
        self.twofactor_url = reverse('twofactor')
        self.singout_url = reverse('singout')
        self.user_update_url = reverse('user_update', args=[self.user.username])

    @patch('auto.views.generate_random_code')
    @patch('auto.views.requests.post')
    def test_singin_success(self, mock_post, mock_generate_code):
        mock_generate_code.return_value = "1234"
        mock_post.return_value.status_code = 200

        data = {
            "sign": "testuser",
            "password": "testpassword"
        }
        response = self.client.post(self.singin_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())

    def test_singin_invalid_password(self):
        data = {
            "sign": "testuser",
            "password": "wrongpassword"
        }
        response = self.client.post(self.singin_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())

    def test_singin_user_not_found(self):
        data = {
            "sign": "nonexistentuser",
            "password": "testpassword"
        }
        response = self.client.post(self.singin_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.json())

    def test_singup_success(self):
        data = {
            "first_name": "Test",
            "last_name": "User",
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword",
            "avatar": None
        }
        response = self.client.post(self.singup_url, data)
        self.assertEqual(response.status_code, 201)
        self.assertIn('message', response.json())

    def test_singup_existing_username(self):
        data = {
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser",
            "email": "newuser@example.com",
            "password": "newpassword",
            "avatar": None
        }
        response = self.client.post(self.singup_url, data)
        self.assertEqual(response.status_code, 409)
        self.assertIn('error', response.json())

    def test_twofactor_success(self):
        TwofactorCodes.objects.create(user=self.user, code="1234", status=True)
        data = {
            "username": "testuser",
            "code": "1234"
        }
        response = self.client.post(self.twofactor_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())

    def test_twofactor_invalid_code(self):
        data = {
            "username": "testuser",
            "code": "wrongcode"
        }
        response = self.client.post(self.twofactor_url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.json())

    def test_singout_success(self):
        self.client.force_login(self.user)
        response = self.client.get(self.singout_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())

    def test_user_update_success(self):
        self.client.force_login(self.user)
        data = {
            "first_name": "Updated",
            "last_name": "User",
            "password": "updatedpassword"
        }
        response = self.client.post(self.user_update_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())
