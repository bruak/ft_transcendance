from django.db import models

class Friends(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("blocked", "Blocked"),
        ("removed", "Removed"),
    ]

    username = models.CharField(max_length=150)
    friendname = models.CharField(max_length=150)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["username", "friendname"], name="unique_friend_request"),
        ]
        indexes = [
            models.Index(fields=["username", "friendname"]),
        ]

    def __str__(self):
        return f"{self.username} -> {self.friendname} ({self.status})"
