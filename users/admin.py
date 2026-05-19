from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'gender', 'birth_date', 'is_staff')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('gender', 'is_staff', 'is_superuser', 'is_active')
    ordering = ('email',)

    fieldsets = UserAdmin.fieldsets + (
        ('Додаткова інформація ФПМ', {'fields': ('gender', 'birth_date', 'avatar', 'bio')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Додаткова інформація ФПМ',
         {'fields': ('email', 'first_name', 'last_name', 'gender', 'birth_date', 'avatar', 'bio')}),
    )