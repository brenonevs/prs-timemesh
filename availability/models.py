from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class AvailabilitySlot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.name} - {self.start_time} to {self.end_time}"
