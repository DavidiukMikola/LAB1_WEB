# QA Board

## Розрахунково-графічна робота

- Студент: Давидюк Микола
- Група: КВ-52мп
- Назва / тема: Web UI Development Using React
- Завдання: Розробити веб-додаток QA Board з окремим React SPA фронтендом, який працює поверх Django REST API та підтримує авторизацію, профіль користувача, список питань, деталі питання, створення питань і відповідей, голосування, маршрутизацію та глобальний стан.
- URL звіту: https://docs.google.com/document/d/11MzrvQQWnc2AIa-JKWWie0-sL68BdxxK/edit

Student Q&A platform built as a Django REST API backend with a separate React SPA frontend.

## Stack

- Backend: Django 4.2, Django REST Framework, token authentication, drf-spectacular
- Frontend: React 18, React Router, Redux Toolkit
- Database: SQLite for development

## Implemented

- User registration and login
- Token-based authentication
- User profile view and update
- Question list, detail view, and creation
- Answer list, answer creation, and voting
- React routing, global state, `useEffect`, `useMemo`, context, and localStorage persistence

## Run locally

1. Install backend dependencies if needed:

```bash
pip install -r requirements.txt
```

2. Install frontend dependencies if needed:

```bash
cd client
npm install
```

3. Start the Django backend:

```bash
.\venv\Scripts\python.exe manage.py runserver 8000
```

4. In a second terminal, start the React app:

```bash
cd client
npm start
```

The frontend runs at `http://localhost:3000` and communicates with the backend at `http://127.0.0.1:8000`.

## Useful URLs

- React app: `http://localhost:3000`
- API docs: `http://127.0.0.1:8000/api/docs/`
- OpenAPI schema: `http://127.0.0.1:8000/api/schema/`
- Report: https://docs.google.com/document/d/11MzrvQQWnc2AIa-JKWWie0-sL68BdxxK/edit
