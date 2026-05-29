import React from 'react';
import { Link } from 'react-router-dom';

function truncate(text, maxLength = 180) {
  if (!text) {
    return '';
  }
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function QuestionCard({ question }) {
  const author = question.author || {};
  const authorName = author.full_name || author.username || 'Анонім';

  return (
    <article className="content-card">
      <div className="card-topline">
        <span className="pill">{question.answers_count || 0} відповідей</span>
        <span className="muted">{question.views_count || 0} переглядів</span>
      </div>
      <h3>
        <Link className="card-link" to={`/questions/${question.slug}`}>
          {question.title}
        </Link>
      </h3>
      <p>{truncate(question.content)}</p>
      <div className="inline-meta">
        <span>{authorName}</span>
        <span>{formatDate(question.created_at)}</span>
      </div>
    </article>
  );
}
