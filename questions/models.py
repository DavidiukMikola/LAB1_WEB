from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Question(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Чернетка'),
        ('published', 'Опубліковано'),
        ('closed', 'Закрито'),
    ]
    title = models.CharField(max_length=200, verbose_name='Заголовок питання')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL (Slug)')
    content = models.TextField(verbose_name='Детальний опис проблеми')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Автор'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='published', verbose_name='Статус')
    views_count = models.PositiveIntegerField(default=0, verbose_name='Кількість переглядів')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата створення')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата оновлення')

    class Meta:
        verbose_name = 'Питання'
        verbose_name_plural = 'Питання'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            # Автоматично генеруємо URL-slug із заголовка, якщо він порожній
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)