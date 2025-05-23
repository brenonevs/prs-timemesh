import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TeamsProvider } from './context/TeamsContext';
import { InvitesProvider } from './context/InvitesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SuccessPage } from './pages/auth/SuccessPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { TeamPage } from './pages/team/TeamPage';
import { NotFound } from './pages/NotFound';

import { ProtectedRoute } from './components/routing/ProtectedRoute';

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router future={router.future}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/success" element={<SuccessPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <TeamsProvider>
                    <InvitesProvider>
                      <Dashboard />
                    </InvitesProvider>
                  </TeamsProvider>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <TeamsProvider>
                    <InvitesProvider>
                      <CalendarPage />
                    </InvitesProvider>
                  </TeamsProvider>
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <TeamsProvider>
                    <InvitesProvider>
                      <TeamPage />
                    </InvitesProvider>
                  </TeamsProvider>
                </ProtectedRoute>
              } />
              
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;