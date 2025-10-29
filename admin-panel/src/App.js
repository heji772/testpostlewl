import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Victims from './pages/Victims';
import Coupons from './pages/Coupons';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedShell = () => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          )}
        />
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/victims" element={<Victims />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
