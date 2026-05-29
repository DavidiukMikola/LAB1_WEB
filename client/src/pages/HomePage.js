import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loadQuestions, selectQuestions, selectQuestionsError, selectQuestionsStatus } from '../features/questions/questionsSlice';
import { QuestionCard } from '../components/QuestionCard';
import { StatCard } from '../components/StatCard';

export function HomePage() {
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const status = useAppSelector(selectQuestionsStatus);
  const error = useAppSelector(selectQuestionsError);
  const totalQuestions = useAppSelector((state) => state.questions.count);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadQuestions());
    }
  }, [dispatch, status]);

  const stats = useMemo(() => {
    const totalAnswers = questions.reduce((sum, question) => sum + (question.answers_count || 0), 0);
    const authorIds = new Set(questions.map((question) => question.author?.id).filter(Boolean));
    return {
      questions: questions.length,
      answers: totalAnswers,
      authors: authorIds.size,
    };
  }, [questions]);

  const featured = useMemo(() => {
    return [...questions]
      .sort((left, right) => (right.views_count || 0) - (left.views_count || 0))
      .slice(0, 3);
  }, [questions]);

  const latest = useMemo(() => {
    return [...questions]
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
      .slice(0, 6);
  }, [questions]);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Студентська платформа</p>
          <h1>Q&A Board для питань, відповідей і командної роботи.</h1>
          <p className="lede">
            Повноцінний React SPA поверх Django REST API: авторизація, профіль, створення контенту,
            маршрутизація та збереження сесії в localStorage.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/questions">
              Переглянути питання
            </Link>
            <Link className="button button-soft" to="/questions/new">
              Додати питання
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
        <div className="stat-grid">
            <StatCard label="Питання" value={totalQuestions || stats.questions} hint="Опубліковані записи" />
            <StatCard label="Відповіді" value={stats.answers} hint="У межах завантажених даних" />
            <StatCard label="Автори" value={stats.authors} hint="Унікальні автори" />
            <StatCard label="Тема" value="Live" hint="Зберігається у localStorage" />
          </div>

          {featured[0] ? (
            <div className="stack-card">
              <p className="eyebrow">Найпомітніше питання</p>
              <Link className="stack-title" to={`/questions/${featured[0].slug}`}>
                {featured[0].title}
              </Link>
              <p className="muted">
                {featured[0].content.length > 180
                  ? `${featured[0].content.slice(0, 180).trimEnd()}…`
                  : featured[0].content}
              </p>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">React компоненти</p>
            <h2>Компонентна композиція</h2>
          </div>
          <span className="pill">JSX + props + state</span>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="eyebrow">Reusable</p>
            <h3>Картки питань</h3>
            <p>Окремий компонент використовує props для побудови стрічки питань.</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">State</p>
            <h3>Форми та взаємодія</h3>
            <p>useState та Redux Toolkit керують авторизацією, пошуком і створенням питань.</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">Router</p>
            <h3>Навігація без перезавантаження</h3>
            <p>React Router показує окремі сторінки для головної, списку, профілю та деталей.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Три найпомітніші питання</h2>
          </div>
          <Link className="button button-ghost" to="/questions">
            Усі питання
          </Link>
        </div>

        <div className="card-grid">
          {status === 'failed' ? (
            <article className="empty-state">
              <h3>Не вдалося завантажити дані.</h3>
              <p>{error}</p>
            </article>
          ) : featured.length > 0 ? (
            featured.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <article className="empty-state">
              <h3>Поки що немає опублікованих питань.</h3>
              <p>Створіть перший запис, щоб запустити стрічку.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest</p>
            <h2>Останні питання</h2>
          </div>
        </div>

        <div className="card-grid">
          {latest.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </section>
    </div>
  );
}
