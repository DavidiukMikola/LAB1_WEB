from django.contrib import admin
from .models import Question

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'created_at', 'author')
    search_fields = ('title', 'content')

    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'