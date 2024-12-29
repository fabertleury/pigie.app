import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useGoalStore } from './store/goalStore';
import { useInitializeGoalData } from './store/goalStore';
import { ToastProvider, useToast } from './components/ui/toaster';
import { Layout } from './components/Layout';
import { 
  Login, 
  Home, 
  Goals, 
  GoalDetails, 
  Profile, 
  DepositNumbers,
  CreateGoalWizard
} from './pages';
import { Notification, useNotification } from './components/Notification';

function App() {
  const { user, initialize } = useAuthStore();
  const { message, type, hide } = useToast();
  const { NotificationComponent, showNotification } = useNotification();

  // Inicializar dados de autenticação
  useEffect(() => {
    initialize();
  }, []);

  // Inicializar dados de metas
  useInitializeGoalData();

  // Adicionar manipulação global de erros
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      showNotification({
        message: `Erro: ${event.error.message}`,
        type: 'error'
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <Router>
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={user ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/goals" 
              element={user ? <Goals /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/goals/new" 
              element={user ? <CreateGoalWizard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/goals/:id" 
              element={user ? <GoalDetails /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/goals/:id/deposit-numbers" 
              element={user ? <DepositNumbers /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/deposit-numbers" 
              element={user ? <DepositNumbers /> : <Navigate to="/login" />} 
            />
          </Routes>
        </Layout>
        {message && (
          <Toast 
            message={message} 
            type={type} 
            onClose={hide} 
          />
        )}
        {NotificationComponent}
      </Router>
    </React.Suspense>
  );
}

function AppWrapper() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

export default AppWrapper;