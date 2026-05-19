from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from questions.models import Question
from answers.models import Answer
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Автоматичне наповнення бази даних тестовими питаннями та відповідями'

    def handle(self, *args, **options):
        self.stdout.write('--- Старт автоматичного заповнення бази ---')

        author, created = User.objects.get_or_create(
            email='student_fpm@kpi.ua',
            defaults={
                'username': 'kpi_tester',
                'first_name': 'Олексій',
                'last_name': 'Тестовий',
                'gender': 'M'
            }
        )
        if created:
            author.set_password('KpiPassword123')
            author.save()


        sample_questions = [
            {
                "title": "Як налаштувати CORS у Django REST Framework?",
                "content": "При запиті з локального фронтенду на localhost:3000 вилітає помилка CORS policy. Які налаштування додати в settings.py?"
            },
            {
                "title": "Помилка маніфесту AppXManifest при інсталяції Python",
                "content": "Спробував поставити Python через Windows Store на лабораторну, але отримую помилку маніфесту розгортання. Як пофіксити?"
            },
            {
                "title": "Чим відрізняється якісний QA Device Engineer від звичайного тестувальника?",
                "content": "Цікавить специфіка роботи з апаратним забезпеченням (IoT, датчики, залізо). Які методики тестування плати зазвичай використовуються?"
            },
            {
                "title": "Як реалізувати Fast Fourier Transform (FFT) для аналізу голосу?",
                "content": "Роблю лабораторну з цифрової обробки сигналів (DSP). Потрібно розбити аудіосигнал на частоти за допомогою алгоритму FFT на C++."
            },
            {
                "title": "Як згенерувати документацію Redoc через Spectacular?",
                "content": "Підключив drf-spectacular за методичкою, але не розумію, за якою адресою тепер шукати готову сторінку з OpenAPI схемою."
            }
        ]


        for item in sample_questions:
            question, q_created = Question.objects.get_or_create(
                title=item["title"],
                defaults={
                    "content": item["content"],
                    "author": author,
                    "status": "published",
                    "views_count": random.randint(10, 150)
                }
            )

            if q_created:
                Answer.objects.create(
                    question=question,
                    author=author,
                    content="Рекомендую перевірити налаштування Мідлварів (Middleware) у settings.py. Порядок імпортів має критичне значення!",
                    is_correct=True,
                    likes_count=random.randint(5, 20)
                )
                Answer.objects.create(
                    question=question,
                    author=author,
                    content="У мене була така ж проблема на минулій лабораторній. Допомогло повне очищення кешу та перезапуск сервера.",
                    is_correct=False,
                    likes_count=random.randint(0, 5)
                )

        self.stdout.write(self.style.SUCCESS('--- База даних успішно заповнена технічними даними! ---'))