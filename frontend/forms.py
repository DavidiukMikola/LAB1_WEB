from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from answers.models import Answer
from questions.models import Question
from users.models import CustomUser


class LoginForm(forms.Form):
    email = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={'placeholder': 'you@example.com'}),
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'placeholder': 'Ваш пароль'}),
    )

    def clean_email(self):
        return self.cleaned_data['email'].strip().lower()

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise ValidationError('Невірний email або пароль.')
            self.user = user
        return cleaned_data


class RegistrationForm(forms.ModelForm):
    password1 = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'placeholder': 'Створіть пароль'}),
        validators=[validate_password],
    )
    password2 = forms.CharField(
        label='Підтвердження пароля',
        widget=forms.PasswordInput(attrs={'placeholder': 'Повторіть пароль'}),
    )

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'username',
            'first_name',
            'last_name',
            'gender',
            'birth_date',
            'avatar',
            'bio',
        ]
        widgets = {
            'email': forms.EmailInput(attrs={'placeholder': 'you@example.com'}),
            'username': forms.TextInput(attrs={'placeholder': 'student_qa'}),
            'first_name': forms.TextInput(attrs={'placeholder': "Ім'я"}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Прізвище'}),
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
            'bio': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Коротко про себе'}),
        }

    def clean_email(self):
        email = self.cleaned_data['email'].strip().lower()
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise ValidationError('Користувач з таким email вже існує.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError('Паролі не збігаються.')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'gender', 'birth_date', 'avatar', 'bio']
        widgets = {
            'first_name': forms.TextInput(attrs={'placeholder': "Ім'я"}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Прізвище'}),
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
            'bio': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Короткий опис профілю'}),
        }


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Наприклад: Як підключити CORS у Django?'}),
            'content': forms.Textarea(
                attrs={
                    'rows': 8,
                    'placeholder': 'Опишіть проблему, очікуваний результат і що вже пробували.',
                }
            ),
        }


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['content']
        widgets = {
            'content': forms.Textarea(
                attrs={
                    'rows': 6,
                    'placeholder': 'Напишіть відповідь, поясніть кроки та додайте приклади.',
                }
            )
        }
