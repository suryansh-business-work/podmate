import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PodsPage from './pages/PodsPage';
import PlacesPage from './pages/PlacesPage';
import PoliciesPage from './pages/PoliciesPage';
import SupportPage from './pages/SupportPage';
import SettingsPage from './pages/SettingsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import UserDetailPage from './pages/UserDetailPage';
import PodDetailPage from './pages/PodDetailPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
import PaymentsPage from './pages/PaymentsPage';
import AiConfigPage from './pages/AiConfig';
import NotificationsPage from './pages/Notifications';
import FinancePage from './pages/Finance';
import CallbacksPage from './pages/CallbacksPage';
import FeedbackPage from './pages/Feedback';
import PodIdeasPage from './pages/PodIdeas';
import SlidersPage from './pages/Sliders';
import LocationsPage from './pages/Locations';
import PodTemplatesPage from './pages/PodTemplates';
import AdminLayout from './layouts/AdminLayout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (_token: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/pods" element={<PodsPage />} />
          <Route path="/pods/:id" element={<PodDetailPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/ai" element={<AiConfigPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/callbacks" element={<CallbacksPage />} />
          <Route path="/feature-flags" element={<FeatureFlagsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/pod-ideas" element={<PodIdeasPage />} />
          <Route path="/sliders" element={<SlidersPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/pod-templates" element={<PodTemplatesPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
};

export default App;
