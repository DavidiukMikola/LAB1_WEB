from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from questions.models import Question
from answers.models import Answer, AnswerVote
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    QuestionSerializer, AnswerSerializer, AnswerVoteSerializer
)

User = get_user_model()


# Реєстрація користувача (Крок 7.2)
class UserRegistrationView(generics.CreateAPIView):
    """
    Реєстрація нового користувача в системі.

    Створює новий акаунт користувача з обов'язковими полями:
    - email (унікальний, корпоративний KPI)
    - username (унікальний нікнейм)
    - first_name (ім'я)
    - last_name (прізвище)
    - password (надійний пароль)
    - password_confirm (підтвердження пароля)

    При успішній реєстрації повертає об'єкт користувача та токен авторизації.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'user': UserProfileSerializer(user).data, 'token': token.key}, status=status.HTTP_201_CREATED)


# Вхід користувача з генерацією токена (Крок 7.2)
class UserLoginView(generics.GenericAPIView):
    """
    Автентифікація користувача (Вхід у систему).

    Приймає облікові дані користувача:
    - email (електронна пошта, вказана при реєстрації)
    - password (пароль)

    У разі успішної перевірки повертає дані профілю та активний Token для авторизації в Headers.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'user': UserProfileSerializer(user).data, 'token': token.key})


# Перегляд та редагування профілю (Крок 7.2)
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Отримання та оновлення профілю поточного авторизованого користувача.

    Доступно тільки для зареєстрованих користувачів.
    Вимагає передачі токена в заголовку Authorization (наприклад, 'Token <key>').

    GET: Повертає повну інформацію про поточного юзера.
    PUT/PATCH: Дозволяє змінити дані профілю (first_name, last_name, bio тощо).
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Список питань та створення нового питання (Крок 7.2)
class QuestionListView(generics.ListCreateAPIView):
    """
    Отримання списку питань або створення нового питання.

    GET: Повертає список усіх опублікованих питань на дошці (доступно всім користувачам без авторизації).
    POST: Створює нове технічне питання. Доступно тільки авторизованим розробникам (автор підставляється автоматично).
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Question.objects.filter(status='published').select_related('author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# Деталі конкретного питання + лічильник переглядів (Крок 7.2)
class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Детальна інформація про конкретне питання, його редагування або видалення.

    Пошук об'єкта здійснюється за текстовим ідентифікатором `slug` в URL.

    GET: Повертає повний опис питання та автоматично збільшує лічильник переглядів (`views_count`) на +1.
    PUT/PATCH: Редагування тексту або заголовка питання (доступно автору).
    DELETE: Видалення питання з платформи (доступно автору).
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return Question.objects.all().select_related('author')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1  # Збільшуємо кількість переглядів при кожному запиті деталки
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# Список відповідей до конкретного питання (Крок 7.2)
class AnswerListCreateView(generics.ListCreateAPIView):
    """
    Отримання списку відповідей або додавання нової відповіді.

    GET: Повертає масив відповідей. Обов'язково передавати ID питання в параметрах запиту (наприклад, `?question=1`).
    POST: Створення нової відповіді на питання. Доступно тільки авторизованим користувачам.
    """
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        question_id = self.request.query_params.get('question')
        if question_id:
            return Answer.objects.filter(question_id=question_id).select_related('author')
        return Answer.objects.none()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# Редагування/видалення своєї відповіді (Крок 7.2)
class AnswerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Управління конкретною відповіддю (Перегляд, редагування, видалення).

    Доступ суворо обмежений — поточний користувач може бачити, змінювати чи видаляти
    тільки ті відповіді, автором яких він є особисто.
    """
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Answer.objects.filter(author=self.request.user)


# Голосування (лайк/дизлайк) за відповідь із динамічним підрахунком (Крок 7.2)
class AnswerVoteView(generics.CreateAPIView):
    """
    Голосування за відповідь (Лайк / Дизлайк).

    Доступно тільки для авторизованих користувачів.

    Приймає JSON:
    - answer (ID відповіді, за яку голосують)
    - vote_type ('like' або 'dislike')

    Автоматично перераховує загальну кількість лайків та дизлайків для цієї відповіді
    та повертає оновлений об'єкт відповіді.
    """
    serializer_class = AnswerVoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vote = serializer.save()

        answer = vote.answer
        answer.likes_count = answer.votes.filter(vote_type='like').count()
        answer.dislikes_count = answer.votes.filter(vote_type='dislike').count()
        answer.save(update_fields=['likes_count', 'dislikes_count'])
        return Response(AnswerSerializer(answer, context={'request': request}).data)


# Загальна інформація про лабораторну (Крок 7.2)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def app_info_view(request):
    """
    Службовий ендпоінт, що повертає інформацію про поточний додаток.

    Доступний для всіх користувачів без авторизації.
    Повертає назву системи, версію API, опис проєкту та ім'я автора.
    """
    return Response({
        'name': 'Q&A Board API',
        'version': '1.0.0',
        'description': 'Студентська дошка питань та відповідей',
        'author': 'Davidiuk Mykola'
    })