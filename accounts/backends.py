from django.contrib.auth.backends import ModelBackend


class RoleBackend(ModelBackend):
    def get_user_permissions(self, user_obj, obj=None):
        return set()

    def get_group_permissions(self, user_obj, obj=None):
        return set()

    def get_all_permissions(self, user_obj, obj=None):
        return set()

    def has_perm(self, user_obj, perm, obj=None):
        return user_obj.is_active and user_obj.is_superuser

    def has_module_perms(self, user_obj, app_label):
        return user_obj.is_active and user_obj.is_superuser
