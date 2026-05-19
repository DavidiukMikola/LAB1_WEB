from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from questions.models import Question
from answers.models import Answer, AnswerVote

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'gender', 'birth_date', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Паролі не співпадають")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Невірний email або пароль')
            data['user'] = user
        else:
            raise serializers.ValidationError('Необхідно вказати email та пароль')
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'gender', 'birth_date', 'bio', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    answers_count = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'title', 'slug', 'content', 'author', 'status', 'views_count', 'answers_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'views_count', 'created_at', 'updated_at']

    def get_answers_count(self, obj):
        return obj.answers.count()


class AnswerSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'question', 'author', 'content', 'is_correct', 'likes_count', 'dislikes_count', 'rating', 'can_edit', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'likes_count', 'dislikes_count', 'rating', 'created_at', 'updated_at']

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user or request.user.is_staff
        return False


class AnswerVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerVote
        fields = ['answer', 'vote_type']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        AnswerVote.objects.filter(answer=validated_data['answer'], user=validated_data['user']).delete()
        return super().create(validated_data)