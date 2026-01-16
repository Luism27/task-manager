from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Task(models.Model):
  id = models.AutoField(primary_key=True)
  title = models.CharField(max_length=200)
  description = models.TextField()
  completed = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="tasks", null=True, blank=True)

  def __str__(self):
    return self.title