import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useTheme } from '../app/theme/ThemeContext';
import { loadProfile, logout, selectAuthUser, selectIsAuthenticated } from '../features/auth/authSlice';

export function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const profileStatus = useAppSelector((state) => state.auth.profileStatus);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen);
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && profileStatus === 'idle') {
      dispatch(loadProfile());
    }
  }, [dispatch, isAuthenticated, profileStatus]);

  const userLabel = user?.full_name || user?.username || 'Профіль';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="site-shell">
      <div className="page-sheen page-sheen-a" />
      <div className="page-sheen page-sheen-b" />

      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">
            <span className="brand-mark">Q</span>
            <span className="brand-text">
              <strong>Q&A Board</strong>
              <small>Student knowledge base</small>
            </span>
          </Link>

          <button className="nav-toggle" type="button" onClick={() => setMenuOpen((value) => !value)}>
            Меню
          </button>

          <nav className="site-nav" aria-label="Primary navigation">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Головна
            </NavLink>
            <NavLink to="/questions" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Питання
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Про проєкт
            </NavLink>
            <a href="http://127.0.0.1:8000/api/docs/" target="_blank" rel="noreferrer">
              API docs
            </a>
          </nav>

          <div className="header-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme}>
              {theme === 'dark' ? 'Світла' : 'Темна'}
            </button>
            {isAuthenticated ? (
              <>
                <Link className="button button-soft" to="/questions/new">
                  Нове питання
                </Link>
                <Link className="chip" to="/profile">
                  {userLabel}
                </Link>
                <button className="button button-ghost" type="button" onClick={handleLogout}>
                  Вийти
                </button>
              </>
            ) : (
              <Link className="button button-soft" to="/auth">
                Увійти
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Q&A Board</p>
            <h2>Лабораторна робота з React SPA</h2>
            <p className="muted">
              React Router, Redux Toolkit, hooks, компонентна композиція та Django REST API.
            </p>
          </div>
          <div>
            <p className="eyebrow">Навігація</p>
            <ul className="footer-links">
              <li><Link to="/questions">Питання</Link></li>
              <li><Link to="/auth">Авторизація</Link></li>
              <li><Link to="/profile">Профіль</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">API</p>
            <ul className="footer-links">
              <li><a href="http://127.0.0.1:8000/api/schema/" target="_blank" rel="noreferrer">Schema</a></li>
              <li><a href="http://127.0.0.1:8000/api/info/" target="_blank" rel="noreferrer">Info</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
