from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and getattr(user, "role", None) == "ADMIN"
        )


class IsParent(BasePermission):
    """Permission to check if user role is PARENT"""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and getattr(user, "role", None) == "PARENT"
        )


class IsBabysitter(BasePermission):
    """Permission to check if user role is BABYSITTER"""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "BABYSITTER"
        )
