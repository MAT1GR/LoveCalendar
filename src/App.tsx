import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './screens/Login';
import Register from './screens/Register';
import Calendar from './screens/Calendar';
import Suggestions from './screens/Suggestions';
import Profile from './screens/Profile';
import Layout from './components/shared/Layout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary-400 dark:bg-primary-600 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/calendar" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/calendar" />} />
      
      {/* Protected routes */}
      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Default route */}
      <Route path="*" element={<Navigate to={user ? "/calendar" : "/login"} />} />
    </Routes>
  );
}

export default App;