from functools import partial
from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response, status

from backend.permissions import IsAdmin, IsOwnerOrAdmin
from .models import Task
from .serializer import TaskSerializer

class TaskListAPIView(APIView):
  def get(self, request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


  def post(self, request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewWithId(APIView):
  def get(self, request, *args, **kwargs):
    try:
      task = Task.objects.get(id=kwargs['id'])
      serializer = TaskSerializer(task)
      return Response(serializer.data, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
      return Response({"error": f"Task with id {kwargs['id']} not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  def _modify_task(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    task = Task.objects.get(id=kwargs['id'])
    serializer = TaskSerializer(task, data=request.data, partial=partial)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  def put(self, request, *args, **kwargs):
    return self._modify_task(request, *args, **kwargs)

  def patch(self, request, *args, **kwargs):
    kwargs['partial'] = True
    return self._modify_task(request, *args, **kwargs)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de tareas.
    - Admin: puede hacer CRUD de todas las tareas de todos los usuarios
    - User normal: solo puede hacer CRUD de sus propias tareas
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        # Admin puede ver todas las tareas
        if self.request.user.is_staff:
            return Task.objects.all()
        # Usuario normal solo ve sus propias tareas
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Si no es admin, la tarea se asigna automáticamente al usuario
        if not self.request.user.is_staff:
          print("User is not staff")
          serializer.is_valid(raise_exception=True)
          print(serializer.validated_data)
          serializer.save(user=self.request.user)
        else:
            # Admin puede asignar tareas a cualquier usuario
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Endpoint para obtener solo las tareas del usuario autenticado"""
        tareas = Task.objects.filter(user=request.user)
        serializer = self.get_serializer(tareas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdmin])
    def by_user(self, request):
        """Endpoint para que admin obtenga tareas de un usuario específico"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id es requerido'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        tareas = Task.objects.filter(user_id=user_id)
        serializer = self.get_serializer(tareas, many=True)
        return Response(serializer.data)