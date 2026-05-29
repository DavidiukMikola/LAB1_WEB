import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { QuestionCard } from '../components/QuestionCard';
import { loadQuestions, selectQuestions, selectQuestionsError, selectQuestionsStatus } from '../features/questions/questionsSlice';

const SEARCH_KEY = 'qa-board-search';

export function QuestionsPage() {
  const dispatch = useAppDispatch();
  const questions = useAppSelector(selectQuestions);
  const status = useAppSelector(selectQuestionsStatus);
  const error = useAppSelector(selectQuestionsError);
  const [query, setQuery] = useState(() => localStorage.getItem(SEARCH_KEY) || '');
  const [sortMode, setSortMode] = useState('popular');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadQuestions());
    }
  }, [dispatch, status]);

  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, query);
  }, [query]);

  const filteredQuestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = normalized
      ? questions.filter((question) => {
          const author = question.author || {};
          return [question.title, question.content, author.full_name, author.username]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalized));
        })
      : [...questions];

    return base.sort((left, right) => {
      if (sortMode === 'recent') {
        return new Date(right.created_at) - new Date(left.created_at);
      }
      if (sortMode === 'discussion') {
        return (right.answers_count || 0) - (left.answers_count || 0);
      }
      return (right.views_count || 0) - (left.views_count || 0);
    });
  }, [questions, query, sortMode]);

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">База знань</p>
          <h1>Усі опубліковані питання</h1>
          <p className="lede">
            Пошук по заголовку, опису або автору. Використовуйте це як каталог для навігації по роботі.
          </p>
        </div>
        <Link className="button button-primary" to="/questions/new">
          Додати питання
        </Link>
      </section>

      <section className="section">
        <div className="search-form">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук по питаннях..."
            aria-label="Пошук по питаннях"
          />
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="popular">Популярні</option>
            <option value="recent">Нові</option>
            <option value="discussion">Найбільше відповідей</option>
          </select>
          <button
            className="button button-ghost"
            type="button"
            onClick={() => {
              setQuery('');
              setSortMode('popular');
            }}
          >
            Скинути
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Результати</p>
            <h2>{filteredQuestions.length} знайдених питань</h2>
          </div>
        </div>

        <div className="card-grid">
          {status === 'failed' ? (
            <article className="empty-state">
              <h3>Не вдалося завантажити дані.</h3>
              <p>{error}</p>
            </article>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <article className="empty-state">
              <h3>За цим запитом нічого не знайдено.</h3>
              <p>Спробуйте інший ключ або очистіть фільтр.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
