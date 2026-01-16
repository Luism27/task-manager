from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
  """
  Permite el acceso a los administradores.
  """
  def has_permission(self, request, view):
    return request.user and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
  """
  Permite el acceso a los propietarios del objeto o a los administradores.
  """
  def has_object_permission(self, request, view, obj):
    if request.user.is_staff:
      return True
    return obj.user == request.user


class IsUserOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso para operaciones sobre usuarios
    """
    def has_object_permission(self, request, view, obj):
        # Admin puede hacer cualquier cosa
        if request.user.is_staff:
            return True
        # Usuario normal solo puede ver/editar su propio perfil
        return obj == request.user