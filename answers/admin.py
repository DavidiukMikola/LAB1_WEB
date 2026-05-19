from django.contrib import admin
from .models import Answer, AnswerVote

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'author', 'is_correct', 'likes_count', 'dislikes_count', 'created_at')
    list_filter = ('is_correct', 'created_at')
    search_fields = ('content', 'author__email', 'question__title')
    date_hierarchy = 'created_at'

@admin.register(AnswerVote)
class AnswerVoteAdmin(admin.ModelAdmin):
    list_display = ('answer', 'user', 'vote_type', 'created_at')
    list_filter = ('vote_type', 'created_at')