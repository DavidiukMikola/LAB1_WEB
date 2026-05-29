import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getApiUrl } from '../api/client';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormField } from '../components/FormField';
import { QuestionCard } from '../components/QuestionCard';
import { loadQuestions, selectQuestions } from '../features/questions/questionsSlice';
import { loadProfile, selectAuthUser, updateProfile } from '../features/auth/authSlice';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const questions = useAppSelector(selectQuestions);
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    gender: '',
    birth_date: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  useEffect(() => {
    if (questions.length === 0) {
      dispatch(loadQuestions());
    }
  }, [dispatch, questions.length]);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        birth_date: user.birth_date || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const myQuestions = useMemo(() => {
    if (!user) {
      return [];
    }
    return questions.filter((question) => question.author?.id === user.id);
  }, [questions, user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = new FormData();
    const appendIfValue = (key, value) => {
      if (value !== '') {
        payload.append(key, value);
      }
    };

    appendIfValue('username', form.username);
    appendIfValue('first_name', form.first_name);
    appendIfValue('last_name', form.last_name);
    appendIfValue('gender', form.gender);
    appendIfValue('birth_date', form.birth_date);
    appendIfValue('bio', form.bio);
    if (avatarFile) {
      payload.append('avatar', avatarFile);
    }
    dispatch(updateProfile(payload));
  };

  if (!user) {
    return (
      <article className="empty-state">
        <h3>Профіль недоступний.</h3>
        <p>Увійдіть в систему, щоб переглянути та редагувати дані.</p>
        <Link className="button button-primary" to="/auth">
          До входу
        </Link>
      </article>
    );
  }

  return (
    <div className="page">
      <section className="detail-hero">
        <div className="profile-hero">
          {user.avatar ? (
            <img className="avatar" src={getApiUrl(user.avatar)} alt={user.full_name || user.username} />
          ) : (
            <div className="avatar avatar-fallback">{(user.first_name || user.username || '?').slice(0, 1)}</div>
          )}
          <div>
            <p className="eyebrow">Профіль</p>
            <h1>{user.full_name || user.username}</h1>
            <p className="lede">{user.bio || 'Користувач ще не додав опис профілю.'}</p>
            <div className="inline-meta">
              <span>{user.email}</span>
              <span>{user.gender || 'Стать не вказана'}</span>
              <span>{user.birth_date || 'Дата народження не вказана'}</span>
            </div>
          </div>
        </div>
        <Link className="button button-ghost" to="/questions/new">
          Нове питання
        </Link>
      </section>

      <section className="content-split">
        <article className="form-card">
          <p className="eyebrow">Редагування</p>
          <h2>Оновити дані профілю</h2>
          <form className="stack-form" onSubmit={handleSubmit}>
            <FormField
              id="profile-username"
              label="Username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
            <FormField
              id="profile-first-name"
              label="Ім'я"
              value={form.first_name}
              onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            />
            <FormField
              id="profile-last-name"
              label="Прізвище"
              value={form.last_name}
              onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            />
            <FormField
              as="select"
              id="profile-gender"
              label="Стать"
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value })}
            >
              <option value="">Оберіть значення</option>
              <option value="M">Чоловіча</option>
              <option value="F">Жіноча</option>
              <option value="O">Інша</option>
            </FormField>
            <FormField
              id="profile-birth-date"
              label="Дата народження"
              type="date"
              value={form.birth_date}
              onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
            />
            <FormField
              as="textarea"
              id="profile-bio"
              label="Біографія"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              placeholder="Коротко про себе"
            />
            <FormField
              id="profile-avatar"
              label="Аватар"
              type="file"
              accept="image/*"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              hint="Файл буде збережено через API."
            />
            <button className="button button-primary" type="submit">
              Зберегти зміни
            </button>
          </form>
        </article>

        <aside className="note-card">
          <p className="eyebrow">Активність</p>
          <h2>Мої показники</h2>
          <ul className="summary-list">
            <li>
              <span>Питання</span>
              <strong>{myQuestions.length}</strong>
            </li>
            <li>
              <span>Статус</span>
              <strong>{user.is_staff ? 'Модератор' : 'Учасник'}</strong>
            </li>
            <li>
              <span>Акаунт</span>
              <strong>{user.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : 'Немає даних'}</strong>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Мої питання</p>
            <h2>Опубліковані записи</h2>
          </div>
        </div>

        <div className="card-grid">
          {myQuestions.length > 0 ? (
            myQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <article className="empty-state">
              <h3>Поки що немає опублікованих питань.</h3>
              <p>Створіть перше питання, щоб заповнити профіль активністю.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
