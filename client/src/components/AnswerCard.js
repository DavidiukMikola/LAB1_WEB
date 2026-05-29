import React from 'react';

function formatDate(value) {
  if (!value) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function AnswerCard({ answer, canVote, onVote }) {
  const author = answer.author || {};
  const authorName = author.full_name || author.username || 'Анонім';
  const rating = (answer.likes_count || 0) - (answer.dislikes_count || 0);

  return (
    <article className={`answer-card ${answer.is_correct ? 'answer-card-highlight' : ''}`.trim()}>
      <div className="card-topline">
        <div className="inline-meta">
          <span>{authorName}</span>
          <span>{formatDate(answer.created_at)}</span>
        </div>
        <span className={`pill ${answer.is_correct ? 'pill-positive' : ''}`.trim()}>
          Рейтинг {rating}
        </span>
      </div>

      <p>{answer.content}</p>

      <div className="hero-actions">
        <span className="pill">Лайки {answer.likes_count || 0}</span>
        <span className="pill">Дизлайки {answer.dislikes_count || 0}</span>
        {answer.is_correct ? <span className="pill pill-positive">Правильна відповідь</span> : null}
        {canVote ? (
          <>
            <button className="button button-ghost" type="button" onClick={() => onVote(answer.id, 'like')}>
              Лайк
            </button>
            <button className="button button-ghost" type="button" onClick={() => onVote(answer.id, 'dislike')}>
              Дизлайк
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
