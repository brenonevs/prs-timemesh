from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class AvailabilitySlot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    title = models.CharField(max_length=100, default='')
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.date} {self.start_time} to {self.end_time}"

    class Meta:
        unique_together = ['user', 'date', 'start_time', 'end_time']
