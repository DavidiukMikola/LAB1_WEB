from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from answers.models import Answer
from questions.models import Question
from users.models import CustomUser

from .forms import AnswerForm, LoginForm, ProfileForm, QuestionForm, RegistrationForm


def _published_questions():
    return (
        Question.objects.filter(status='published')
        .select_related('author')
        .annotate(answer_count=Count('answers'))
    )


def _question_or_404(request, slug):
    queryset = Question.objects.select_related('author')
    if request.user.is_authenticated:
        if request.user.is_staff:
            return get_object_or_404(queryset, slug=slug)
        return get_object_or_404(queryset.filter(Q(status='published') | Q(author=request.user)), slug=slug)
    return get_object_or_404(queryset.filter(status='published'), slug=slug)


def home(request):
    questions = _published_questions().order_by('-views_count', '-created_at')
    context = {
        'stats': {
            'questions': questions.count(),
            'answers': Answer.objects.count(),
            'users': CustomUser.objects.count(),
            'resolved': Answer.objects.filter(is_correct=True).count(),
        },
        'featured_questions': list(questions[:3]),
        'latest_questions': list(_published_questions().order_by('-created_at')[:6]),
        'api_questions_url': reverse('api:question-list'),
    }
    return render(request, 'frontend/home.html', context)


def about(request):
    context = {
        'stats': {
            'questions': _published_questions().count(),
            'answers': Answer.objects.count(),
            'users': CustomUser.objects.count(),
        }
    }
    return render(request, 'frontend/about.html', context)


def site_map(request):
    pages = [
        {'title': 'Головна', 'url': reverse('frontend:home'), 'description': 'Огляд платформи та ключові показники.'},
        {'title': 'Питання', 'url': reverse('frontend:questions'), 'description': 'Список усіх опублікованих питань.'},
        {'title': 'Додати питання', 'url': reverse('frontend:question-create'), 'description': 'Форма для створення нового питання.'},
        {'title': 'Авторизація', 'url': reverse('frontend:auth'), 'description': 'Вхід або реєстрація користувача.'},
        {'title': 'Профіль', 'url': reverse('frontend:profile'), 'description': 'Персональні дані та активність.'},
        {'title': 'Про проєкт', 'url': reverse('frontend:about'), 'description': 'Короткий опис архітектури й можливостей.'},
        {'title': 'API документація', 'url': reverse('redoc'), 'description': 'OpenAPI документація через drf-spectacular.'},
        {'title': 'API інформація', 'url': reverse('api:app-info'), 'description': 'Службова інформація про застосунок.'},
    ]
    return render(request, 'frontend/sitemap.html', {'pages': pages})


def questions_list(request):
    query = request.GET.get('q', '').strip()
    questions = _published_questions().order_by('-created_at')
    if query:
        questions = questions.filter(
            Q(title__icontains=query)
            | Q(content__icontains=query)
            | Q(author__first_name__icontains=query)
            | Q(author__last_name__icontains=query)
            | Q(author__username__icontains=query)
        )
    return render(
        request,
        'frontend/questions.html',
        {
            'questions': questions,
            'query': query,
            'create_url': reverse('frontend:question-create'),
        },
    )


@login_required
def question_create(request):
    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            question = form.save(commit=False)
            question.author = request.user
            question.status = 'published'
            question.save()
            messages.success(request, 'Питання опубліковано.')
            return redirect('frontend:question-detail', slug=question.slug)
    else:
        form = QuestionForm()
    return render(request, 'frontend/question_form.html', {'form': form})


def question_detail(request, slug):
    question = _question_or_404(request, slug)
    answers = question.answers.select_related('author').order_by('-is_correct', '-likes_count', 'created_at')

    if request.method == 'POST':
        if not request.user.is_authenticated:
            messages.info(request, 'Увійдіть, щоб залишити відповідь.')
            return redirect('frontend:auth')
        form = AnswerForm(request.POST)
        if form.is_valid():
            answer = form.save(commit=False)
            answer.question = question
            answer.author = request.user
            answer.save()
            messages.success(request, 'Відповідь додано.')
            return redirect('frontend:question-detail', slug=question.slug)
    else:
        form = AnswerForm()
        question.views_count += 1
        question.save(update_fields=['views_count'])

    return render(
        request,
        'frontend/question_detail.html',
        {
            'question': question,
            'answers': answers,
            'form': form,
        },
    )


def auth_view(request):
    if request.user.is_authenticated:
        return redirect('frontend:profile')

    login_form = LoginForm()
    registration_form = RegistrationForm()
    active_tab = 'login'

    if request.method == 'POST':
        form_type = request.POST.get('form_type')
        if form_type == 'register':
            registration_form = RegistrationForm(request.POST, request.FILES)
            active_tab = 'register'
            if registration_form.is_valid():
                user = registration_form.save()
                login(request, user)
                messages.success(request, 'Акаунт створено.')
                return redirect('frontend:profile')
        else:
            login_form = LoginForm(request.POST)
            active_tab = 'login'
            if login_form.is_valid():
                login(request, login_form.user)
                messages.success(request, 'Вхід виконано успішно.')
                return redirect('frontend:profile')

    return render(
        request,
        'frontend/auth.html',
        {
            'login_form': login_form,
            'registration_form': registration_form,
            'active_tab': active_tab,
        },
    )


@require_POST
def logout_view(request):
    logout(request)
    messages.info(request, 'Вихід виконано.')
    return redirect('frontend:home')


@login_required
def profile(request):
    if request.method == 'POST':
        profile_form = ProfileForm(request.POST, request.FILES, instance=request.user)
        if profile_form.is_valid():
            profile_form.save()
            messages.success(request, 'Профіль оновлено.')
            return redirect('frontend:profile')
    else:
        profile_form = ProfileForm(instance=request.user)

    context = {
        'profile_form': profile_form,
        'my_questions': request.user.questions.filter(status='published').annotate(answer_count=Count('answers')).order_by('-created_at'),
        'my_answers': request.user.answers.select_related('question', 'question__author').order_by('-created_at'),
    }
    return render(request, 'frontend/profile.html', context)
