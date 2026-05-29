from django.urls import path

from . import views

app_name = 'frontend'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('site-map/', views.site_map, name='site-map'),
    path('auth/', views.auth_view, name='auth'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('questions/', views.questions_list, name='questions'),
    path('questions/new/', views.question_create, name='question-create'),
    path('questions/<slug:slug>/', views.question_detail, name='question-detail'),
]
