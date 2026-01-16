from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework import viewsets

from backend.permissions import IsAdmin, IsUserOwnerOrAdmin
from users.serializer import LoginSerializer, RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios.
    - Admin: puede hacer CRUD completo de todos los usuarios
    - User normal: solo puede ver y editar su propio perfil
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Admin puede ver todos los usuarios
        if self.request.user.is_staff:
            return User.objects.all()
        # Usuario normal solo puede ver su propio perfil
        return User.objects.filter(id=self.request.user.id)
    
    def get_permissions(self):
        # Para crear, actualizar o eliminar usuarios, debe ser admin
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsUserOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def make_admin(self, request, pk=None):
        """Endpoint para que un admin convierta a otro usuario en admin"""
        user = self.get_object()
        user.is_staff = True
        user.save()
        return Response({'message': f'{user.username} ahora es administrador'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def remove_admin(self, request, pk=None):
        """Endpoint para que un admin quite privilegios de admin"""
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'No puedes removerte tus propios privilegios'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        user.is_staff = False
        user.save()
        return Response({'message': f'{user.username} ya no es administrador'})
