from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Safe methods (GET, HEAD, OPTIONS) allowed for everyone.
    Write methods only for the object owner.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_field = getattr(obj, 'reported_by', None) or getattr(obj, 'author', None)
        return owner_field == request.user


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Access only for the object owner or admin/staff users.
    """

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        owner_field = getattr(obj, 'reported_by', None) or getattr(obj, 'author', None)
        return owner_field == request.user
