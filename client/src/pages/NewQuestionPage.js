import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormField } from '../components/FormField';
import { clearMutationState, createQuestion } from '../features/questions/questionsSlice';

export function NewQuestionPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mutationStatus = useAppSelector((state) => state.questions.mutationStatus);
  const mutationError = useAppSelector((state) => state.questions.mutationError);
  const [form, setForm] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    dispatch(clearMutationState());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(createQuestion(form))
      .unwrap()
      .then((question) => navigate(`/questions/${question.slug}`));
  };

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Створення</p>
          <h1>Додати нове питання</h1>
          <p className="lede">
            Структуруйте заголовок і опис так, щоб інші могли швидко зрозуміти проблему й контекст.
          </p>
        </div>
      </section>

      <section className="form-layout">
        <article className="form-card">
          <form className="stack-form" onSubmit={handleSubmit}>
            <FormField
              id="question-title"
              label="Заголовок"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Наприклад: Як підключити CORS у Django?"
            />
            <FormField
              as="textarea"
              id="question-content"
              label="Опис проблеми"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="Опишіть проблему, очікуваний результат і що вже пробували."
            />
            {mutationError ? <div className="form-errors">{mutationError}</div> : null}
            <button className="button button-primary" type="submit" disabled={mutationStatus === 'loading'}>
              {mutationStatus === 'loading' ? 'Публікація...' : 'Опублікувати'}
            </button>
          </form>
        </article>

        <aside className="note-card">
          <p className="eyebrow">Поради</p>
          <h2>Що додати в опис</h2>
          <ul className="check-list">
            <li>Де саме виникає помилка.</li>
            <li>Який результат ви очікуєте.</li>
            <li>Що вже пробували зробити.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
