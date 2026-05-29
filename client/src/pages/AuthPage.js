import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormField } from '../components/FormField';
import { loginUser, registerUser, selectIsAuthenticated } from '../features/auth/authSlice';

const defaultLogin = {
  email: '',
  password: '',
};

const defaultRegister = {
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  gender: '',
  birth_date: '',
  password: '',
  password_confirm: '',
};

export function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);
  const [tab, setTab] = useState('login');
  const [loginForm, setLoginForm] = useState(defaultLogin);
  const [registerForm, setRegisterForm] = useState(defaultRegister);

  const redirectTo = useMemo(() => {
    return location.state?.from?.pathname || '/profile';
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(loginForm))
      .unwrap()
      .then(() => navigate(redirectTo, { replace: true }));
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(registerForm).filter(([, value]) => value !== '')
    );
    dispatch(registerUser(payload))
      .unwrap()
      .then(() => navigate(redirectTo, { replace: true }));
  };

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Акаунт</p>
          <h1>Вхід і реєстрація</h1>
          <p className="lede">
            Один екран для доступу до профілю, створення питань та взаємодії з дошкою.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="hero-actions">
          <button className={`button ${tab === 'login' ? 'button-primary' : 'button-ghost'}`} type="button" onClick={() => setTab('login')}>
            Вхід
          </button>
          <button className={`button ${tab === 'register' ? 'button-primary' : 'button-ghost'}`} type="button" onClick={() => setTab('register')}>
            Реєстрація
          </button>
        </div>
      </section>

      <section className={tab === 'login' ? 'auth-grid' : 'auth-grid'}>
        {tab === 'login' ? (
          <article className="form-card">
            <p className="eyebrow">Вхід</p>
            <h2>Повернутися до платформи</h2>
            <form className="stack-form" onSubmit={handleLoginSubmit}>
              <FormField
                id="login-email"
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="you@example.com"
              />
              <FormField
                id="login-password"
                label="Пароль"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Ваш пароль"
              />
              {authError ? <div className="form-errors">{authError}</div> : null}
              <button className="button button-primary" type="submit" disabled={authStatus === 'loading'}>
                {authStatus === 'loading' ? 'Вхід...' : 'Увійти'}
              </button>
            </form>
          </article>
        ) : null}

        {tab === 'register' ? (
          <article className="form-card">
            <p className="eyebrow">Реєстрація</p>
            <h2>Створити новий акаунт</h2>
            <form className="stack-form" onSubmit={handleRegisterSubmit}>
              <FormField
                id="register-email"
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                placeholder="you@example.com"
              />
              <FormField
                id="register-username"
                label="Username"
                value={registerForm.username}
                onChange={(event) => setRegisterForm({ ...registerForm, username: event.target.value })}
                placeholder="student_qa"
              />
              <FormField
                id="register-first-name"
                label="Ім'я"
                value={registerForm.first_name}
                onChange={(event) => setRegisterForm({ ...registerForm, first_name: event.target.value })}
                placeholder="Ім'я"
              />
              <FormField
                id="register-last-name"
                label="Прізвище"
                value={registerForm.last_name}
                onChange={(event) => setRegisterForm({ ...registerForm, last_name: event.target.value })}
                placeholder="Прізвище"
              />
              <FormField
                as="select"
                id="register-gender"
                label="Стать"
                value={registerForm.gender}
                onChange={(event) => setRegisterForm({ ...registerForm, gender: event.target.value })}
              >
                <option value="">Оберіть значення</option>
                <option value="M">Чоловіча</option>
                <option value="F">Жіноча</option>
                <option value="O">Інша</option>
              </FormField>
              <FormField
                id="register-birth-date"
                label="Дата народження"
                type="date"
                value={registerForm.birth_date}
                onChange={(event) => setRegisterForm({ ...registerForm, birth_date: event.target.value })}
              />
              <FormField
                id="register-password"
                label="Пароль"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                placeholder="Створіть пароль"
              />
              <FormField
                id="register-password-confirm"
                label="Підтвердження пароля"
                type="password"
                value={registerForm.password_confirm}
                onChange={(event) => setRegisterForm({ ...registerForm, password_confirm: event.target.value })}
                placeholder="Повторіть пароль"
              />
              {authError ? <div className="form-errors">{authError}</div> : null}
              <button className="button button-primary" type="submit" disabled={authStatus === 'loading'}>
                {authStatus === 'loading' ? 'Реєстрація...' : 'Зареєструватися'}
              </button>
            </form>
          </article>
        ) : null}

        <aside className="note-card">
          <p className="eyebrow">Підказка</p>
          <h2>Що дає акаунт</h2>
          <ul className="check-list">
            <li>Створення нових питань.</li>
            <li>Відповіді на запитання інших користувачів.</li>
            <li>Перегляд і редагування профілю.</li>
            <li>Голосування за корисні відповіді.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
