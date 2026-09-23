import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StoriesList from './pages/StoriesList';
import StoryEditor from './pages/StoryEditor';
import AuthorsList from './pages/AuthorsList';
import UsersList from './pages/UsersList';

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stories"
        element={
          <ProtectedRoute>
            <StoriesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stories/new"
        element={
          <ProtectedRoute>
            <StoryEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stories/:id/edit"
        element={
          <ProtectedRoute>
            <StoryEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/authors"
        element={
          <ProtectedRoute>
            <AuthorsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
