from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.UserLoginView.as_view(), name='login'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),

    path('questions/', views.QuestionListView.as_view(), name='question-list'),
    path('questions/<slug:slug>/', views.QuestionDetailView.as_view(), name='question-detail'),

    path('answers/', views.AnswerListCreateView.as_view(), name='answer-list-create'),
    path('answers/<int:pk>/', views.AnswerDetailView.as_view(), name='answer-detail'),
    path('answers/vote/', views.AnswerVoteView.as_view(), name='answer-vote'),

    path('info/', views.app_info_view, name='app-info'),
]