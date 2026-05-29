import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { NewQuestionPage } from './pages/NewQuestionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { QuestionsPage } from './pages/QuestionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="questions/:slug" element={<QuestionDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="questions/new" element={<NewQuestionPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="auth" element={<AuthPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
