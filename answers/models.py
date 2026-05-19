from django.db import models
from django.conf import settings
from questions.models import Question

class Answer(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Питання'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Автор'
    )
    content = models.TextField(verbose_name='Текст відповіді')
    is_correct = models.BooleanField(default=False, verbose_name='Позначено як правильна відповідь')
    likes_count = models.PositiveIntegerField(default=0, verbose_name='Кількість лайків')
    dislikes_count = models.PositiveIntegerField(default=0, verbose_name='Кількість дизлайків')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата створення')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата оновлення')

    class Meta:
        verbose_name = 'Відповідь'
        verbose_name_plural = 'Відповіді'
        # Сортуємо відповіді: спочатку з найбільшою кількістю лайків
        ordering = ['-likes_count', 'created_at']

    def __str__(self):
        return f"Відповідь від {self.author.first_name} до питання: {self.question.title}"

    @property
    def rating(self):
        return self.likes_count - self.dislikes_count


class AnswerVote(models.Model):
    VOTE_CHOICES = [
        ('like', 'Лайк'),
        ('dislike', 'Дизлайк'),
    ]
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Один користувач може проголосувати за одну конкретну відповідь лише один раз
        unique_together = ('answer', 'user')
        verbose_name = 'Голос за відповідь'
        verbose_name_plural = 'Голоси за відповіді'