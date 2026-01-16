from rest_framework import serializers
from .models import Task



class TaskSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Task
        fields = ('id', 'user', 'usuario_username', 'title', 'description', 
                  'completed', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

    def create(self, validated_data):
        # Si no es admin, forzar que la tarea sea del usuario autenticado
        request = self.context.get('request')
        if request and not request.user.is_staff:
            validated_data['user'] = request.user
        return super().create(validated_data)