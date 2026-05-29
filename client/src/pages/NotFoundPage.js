import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <article className="empty-state">
      <h3>Сторінку не знайдено</h3>
      <p>Перейдіть на головну або відкрийте список питань.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/">
          На головну
        </Link>
        <Link className="button button-ghost" to="/questions">
          До питань
        </Link>
      </div>
    </article>
  );
}
