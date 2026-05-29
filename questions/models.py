from django.db import models
from django.conf import settings
from django.utils.text import slugify

TRANSLITERATION_MAP = str.maketrans(
    {
        'а': 'a',
        'б': 'b',
        'в': 'v',
        'г': 'h',
        'ґ': 'g',
        'д': 'd',
        'е': 'e',
        'є': 'ye',
        'ж': 'zh',
        'з': 'z',
        'и': 'y',
        'і': 'i',
        'ї': 'yi',
        'й': 'y',
        'к': 'k',
        'л': 'l',
        'м': 'm',
        'н': 'n',
        'о': 'o',
        'п': 'p',
        'р': 'r',
        'с': 's',
        'т': 't',
        'у': 'u',
        'ф': 'f',
        'х': 'kh',
        'ц': 'ts',
        'ч': 'ch',
        'ш': 'sh',
        'щ': 'shch',
        'ю': 'yu',
        'я': 'ya',
        'ь': '',
        'А': 'A',
        'Б': 'B',
        'В': 'V',
        'Г': 'H',
        'Ґ': 'G',
        'Д': 'D',
        'Е': 'E',
        'Є': 'Ye',
        'Ж': 'Zh',
        'З': 'Z',
        'И': 'Y',
        'І': 'I',
        'Ї': 'Yi',
        'Й': 'Y',
        'К': 'K',
        'Л': 'L',
        'М': 'M',
        'Н': 'N',
        'О': 'O',
        'П': 'P',
        'Р': 'R',
        'С': 'S',
        'Т': 'T',
        'У': 'U',
        'Ф': 'F',
        'Х': 'Kh',
        'Ц': 'Ts',
        'Ч': 'Ch',
        'Ш': 'Sh',
        'Щ': 'Shch',
        'Ю': 'Yu',
        'Я': 'Ya',
        'Ь': '',
    }
)


def transliterated_slug(value):
    return slugify(value.translate(TRANSLITERATION_MAP))


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
            base_slug = transliterated_slug(self.title) or 'question'
            slug = base_slug
            suffix = 2
            while Question.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{suffix}'
                suffix += 1
            self.slug = slug
        super().save(*args, **kwargs)
