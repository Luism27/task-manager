from django.contrib import admin

from tasks.models import Task

# Register your models here.
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
  list_display = ('title', 'description', 'completed', 'created_at', 'updated_at')
  list_filter = ('completed', 'created_at', 'updated_at')
  search_fields = ('title', 'description', 'user__username')