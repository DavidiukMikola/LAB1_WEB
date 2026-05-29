(function () {
  const mount = document.querySelector('[data-react-questions]');
  if (!mount || !window.React || !window.ReactDOM || typeof ReactDOM.createRoot !== 'function') {
    return;
  }

  const h = React.createElement;
  const { useEffect, useMemo, useState } = React;
  const endpoint = mount.dataset.endpoint || '/api/questions/';
  const detailBase = mount.dataset.detailBase || '/questions/';
  const storageKey = 'qa-board-widget-filter';

  function normalizeItems(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.results)) {
      return payload.results;
    }
    return [];
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function shorten(text) {
    if (!text) {
      return '';
    }
    return text.length > 170 ? text.slice(0, 170).trimEnd() + '…' : text;
  }

  function Widget() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState(function () {
      return localStorage.getItem(storageKey) || '';
    });
    const [sortMode, setSortMode] = useState('popular');

    useEffect(function () {
      let cancelled = false;
      fetch(endpoint, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Не вдалося завантажити дані');
          }
          return response.json();
        })
        .then(function (payload) {
          if (!cancelled) {
            setItems(normalizeItems(payload));
          }
        })
        .catch(function (fetchError) {
          if (!cancelled) {
            setError(fetchError.message || 'Помилка завантаження');
          }
        })
        .finally(function () {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return function () {
        cancelled = true;
      };
    }, []);

    useEffect(function () {
      localStorage.setItem(storageKey, query);
    }, [query]);

    const filteredItems = useMemo(function () {
      const normalizedQuery = query.trim().toLowerCase();
      const baseItems = normalizedQuery
        ? items.filter(function (item) {
            const author = item.author || {};
            return [item.title, item.content, author.full_name, author.username]
              .filter(Boolean)
              .some(function (value) {
                return String(value).toLowerCase().includes(normalizedQuery);
              });
          })
        : items.slice();

      return baseItems.sort(function (left, right) {
        if (sortMode === 'recent') {
          return new Date(right.created_at) - new Date(left.created_at);
        }
        if (sortMode === 'discussion') {
          return (right.answers_count || 0) - (left.answers_count || 0);
        }
        return (right.views_count || 0) - (left.views_count || 0);
      });
    }, [items, query, sortMode]);

    return h(
      'div',
      { className: 'react-widget' },
      h(
        'div',
        { className: 'react-toolbar' },
        h('input', {
          className: 'react-input',
          type: 'search',
          placeholder: 'Шукати по заголовку, тексту або автору...',
          value: query,
          onChange: function (event) {
            setQuery(event.target.value);
          },
        }),
        h(
          'select',
          {
            className: 'react-select',
            value: sortMode,
            onChange: function (event) {
              setSortMode(event.target.value);
            },
          },
          h('option', { value: 'popular' }, 'Популярні'),
          h('option', { value: 'recent' }, 'Нові'),
          h('option', { value: 'discussion' }, 'Найбільше відповідей')
        )
      ),
      loading
        ? h('p', { className: 'react-status' }, 'Завантаження даних...')
        : error
          ? h('p', { className: 'react-status' }, error)
          : h(
              'div',
              { className: 'react-list' },
              filteredItems.length
                ? filteredItems.slice(0, 4).map(function (item) {
                    const author = item.author || {};
                    const slug = item.slug || '';
                    return h(
                      'article',
                      { className: 'react-item', key: slug || item.id },
                      h(
                        'div',
                        { className: 'card-topline' },
                        h('span', { className: 'pill' }, `${item.answers_count || 0} відповідей`),
                        h('span', { className: 'muted' }, `${item.views_count || 0} переглядів`)
                      ),
                      h(
                        'h3',
                        null,
                        h(
                          'a',
                          {
                            href: `${detailBase.replace(/\/$/, '')}/${slug}/`,
                          },
                          item.title
                        )
                      ),
                      h('p', null, shorten(item.content)),
                      h(
                        'div',
                        { className: 'inline-meta' },
                        h('span', null, author.full_name || author.username || 'Анонім'),
                        h('span', null, formatDate(item.created_at))
                      )
                    );
                  })
                : h(
                    'div',
                    { className: 'empty-state' },
                    h('h3', null, 'Нічого не знайдено'),
                    h('p', null, 'Змініть запит або спробуйте інший режим сортування.')
                  )
            )
    );
  }

  ReactDOM.createRoot(mount).render(h(Widget));
})();
