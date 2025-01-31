from django.db import models

class Friends(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),  # Bekleyen istek
        ("accepted", "Accepted"),  # Kabul edilen arkadaşlık
        ("rejected", "Rejected"),  # Reddedilen istek
        ("blocked", "Blocked"),  # Engellenen kullanıcı
    ]

    username = models.CharField(max_length=150)  # Kullanıcı adı
    friendname = models.CharField(max_length=150)  # Arkadaşın adı
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")  # Arkadaşlık durumu
    created_at = models.DateTimeField(auto_now_add=True)  # İstek oluşturulma tarihi
    updated_at = models.DateTimeField(auto_now=True)  # Son güncellenme tarihi

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["username", "friendname"], name="unique_friend_request"),
        ]
        indexes = [
            models.Index(fields=["username", "friendname"]),
        ]

    def __str__(self):
        return f"{self.username} -> {self.friendname} ({self.status})"
