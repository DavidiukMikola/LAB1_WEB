import React from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Про проєкт</p>
          <h1>Навчальний Q&A сайт на React і Django REST API</h1>
          <p className="lede">
            Цей варіант поєднує React Router, Redux Toolkit, hooks, компонентну композицію та збереження
            сесії через localStorage. Серверна частина на Django лишилась як API і база даних.
          </p>
        </div>
        <Link className="button button-primary" to="/questions">
          До питань
        </Link>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <p className="eyebrow">Frontend</p>
          <h3>React SPA</h3>
          <p>Окремий інтерфейс з маршрутизацією, сторінками та повторно використаними компонентами.</p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">State</p>
          <h3>Redux Toolkit</h3>
          <p>Сесія, профіль, список питань, деталі, відповіді та голосування керуються через slices.</p>
        </article>
        <article className="feature-card">
          <p className="eyebrow">Backend</p>
          <h3>Django API</h3>
          <p>Auth, questions, answers, votes, profile and schema endpoints працюють як окремий сервер.</p>
        </article>
      </section>

      <section className="content-split">
        <article className="content-card">
          <p className="eyebrow">Що є в UI</p>
          <ul className="check-list">
            <li>Головна з hero, статистикою та featured-стрічкою.</li>
            <li>Список питань з пошуком і сортуванням.</li>
            <li>Детальна сторінка питання з відповідями та голосуванням.</li>
            <li>Вхід, реєстрація, профіль і створення нового питання.</li>
          </ul>
        </article>

        <aside className="note-card">
          <p className="eyebrow">Маршрути</p>
          <h2>SPA layout</h2>
          <ul className="summary-list">
            <li><span>Home</span><strong>/</strong></li>
            <li><span>Questions</span><strong>/questions</strong></li>
            <li><span>Detail</span><strong>/questions/:slug</strong></li>
            <li><span>Auth</span><strong>/auth</strong></li>
            <li><span>Profile</span><strong>/profile</strong></li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
