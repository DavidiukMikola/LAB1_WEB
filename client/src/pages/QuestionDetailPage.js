import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormField } from '../components/FormField';
import { AnswerCard } from '../components/AnswerCard';
import {
  clearCurrentQuestion,
  clearMutationState,
  createAnswer,
  loadQuestion,
  selectQuestionAnswers,
  selectQuestionDetail,
  selectQuestionDetailError,
  selectQuestionDetailStatus,
  selectMutationError,
  selectMutationStatus,
  voteAnswer,
} from '../features/questions/questionsSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';

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

function statusLabel(status) {
  const labels = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    closed: 'Закрито',
  };
  return labels[status] || status;
}

export function QuestionDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const question = useAppSelector(selectQuestionDetail);
  const answers = useAppSelector(selectQuestionAnswers);
  const detailStatus = useAppSelector(selectQuestionDetailStatus);
  const detailError = useAppSelector(selectQuestionDetailError);
  const mutationStatus = useAppSelector(selectMutationStatus);
  const mutationError = useAppSelector(selectMutationError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [content, setContent] = useState('');

  useEffect(() => {
    dispatch(loadQuestion(slug));
    dispatch(clearMutationState());
    return () => {
      dispatch(clearCurrentQuestion());
    };
  }, [dispatch, slug]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!question) {
      return;
    }
    dispatch(
      createAnswer({
        question: question.id,
        content,
      })
    )
      .unwrap()
      .then(() => setContent(''));
  };

  const handleVote = (answerId, voteType) => {
    dispatch(voteAnswer({ answer: answerId, vote_type: voteType }))
      .unwrap()
      .catch(() => {
        // mutation error is handled in the slice
      });
  };

  if (detailStatus === 'loading') {
    return (
      <article className="empty-state">
        <h3>Завантаження питання...</h3>
      </article>
    );
  }

  if (detailStatus === 'failed') {
    return (
      <article className="empty-state">
        <h3>Не вдалося відкрити питання.</h3>
        <p>{detailError}</p>
        <Link className="button button-primary" to="/questions">
          До списку
        </Link>
      </article>
    );
  }

  if (!question) {
    return null;
  }

  const author = question.author || {};
  const authorName = author.full_name || author.username || 'Анонім';

  return (
    <div className="page">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Питання</p>
          <h1>{question.title}</h1>
          <div className="inline-meta">
            <span>{authorName}</span>
            <span>{formatDate(question.created_at)}</span>
            <span>{question.views_count} переглядів</span>
            <span>{answers.length} відповідей</span>
          </div>
        </div>

        <div className="hero-actions hero-actions-right">
          <Link className="button button-ghost" to="/questions">
            До списку
          </Link>
          <Link className="button button-soft" to="/questions/new">
            Нове питання
          </Link>
        </div>
      </section>

      <section className="content-split">
        <article className="content-card">
          <p>{question.content}</p>
        </article>

        <aside className="info-card">
          <p className="eyebrow">Інформація</p>
          <h3>Підсумок</h3>
          <ul className="summary-list">
            <li>
              <span>Автор</span>
              <strong>{authorName}</strong>
            </li>
            <li>
              <span>Статус</span>
              <strong>{statusLabel(question.status)}</strong>
            </li>
            <li>
              <span>Відповіді</span>
              <strong>{answers.length}</strong>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Відповіді</p>
            <h2>Обговорення</h2>
          </div>
        </div>

        <div className="answers-list">
          {answers.length > 0 ? (
            answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                canVote={isAuthenticated}
                onVote={handleVote}
              />
            ))
          ) : (
            <article className="empty-state">
              <h3>Поки що немає відповідей.</h3>
              <p>Будьте першим, хто допоможе з рішенням.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        {isAuthenticated ? (
          <article className="form-card">
            <p className="eyebrow">Нова відповідь</p>
            <h2>Додати відповідь</h2>
            <form className="stack-form" onSubmit={handleSubmit}>
              <FormField
                as="textarea"
                id="answer-content"
                label="Текст відповіді"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Опишіть рішення, кроки або поради."
                error={mutationStatus === 'failed' ? mutationError : ''}
              />
              <button className="button button-primary" type="submit" disabled={mutationStatus === 'loading'}>
                {mutationStatus === 'loading' ? 'Надсилання...' : 'Опублікувати відповідь'}
              </button>
            </form>
          </article>
        ) : (
          <article className="note-card">
            <p className="eyebrow">Авторизація</p>
            <h2>Увійдіть, щоб відповідати</h2>
            <p className="muted">
              Авторизовані користувачі можуть залишати відповіді та голосувати за корисні коментарі.
            </p>
            <Link className="button button-primary" to="/auth" state={{ from: { pathname: `/questions/${slug}` } }}>
              До входу
            </Link>
          </article>
        )}
      </section>
    </div>
  );
}
