// App.js
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateLoan from './components/CreateLoan';
import ViewApplications from './components/ViewApplications';
import Services from './components/Services';
import LoanSearch from './components/LoanSearch'; // For authenticated users
import LoanStatusCheck from './components/LoanStatusCheck'; // For public access
import NavBar from './components/NavBar';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token with backend
          await authAPI.verifyToken();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setCurrentView('login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {isAuthenticated && (
        <NavBar 
          userName={user?.full_name || user?.username || 'User'} 
          onLogout={handleLogout}
          onNavigate={handleNavigation}
          currentView={currentView}
        />
      )}

      <main>
        {!isAuthenticated && currentView === 'login' && (
          <LoginPage 
            onLogin={handleLogin}
            onSwitchRegister={() => setCurrentView('register')}
            onPublicSearch={() => setCurrentView('status-check')}
            onStatusCheck={() => setCurrentView('status-check')}
          />
        )}

        {!isAuthenticated && currentView === 'register' && (
          <Register 
            onBack={() => setCurrentView('login')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {!isAuthenticated && currentView === 'status-check' && (
          <div>
            <button 
              onClick={() => setCurrentView('login')}
              style={{ 
                margin: '20px',
                padding: '10px 20px', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back to Login
            </button>
            <LoanStatusCheck 
              isAuthenticated={isAuthenticated}
              onNavigateToLogin={() => setCurrentView('login')}
              onNavigateToRegister={() => setCurrentView('register')}
            />
          </div>
        )}

        {isAuthenticated && currentView === 'dashboard' && (
          <Dashboard onNavigate={handleNavigation} />
        )}

        {isAuthenticated && currentView === 'create-loan' && (
          <CreateLoan onBack={() => setCurrentView('dashboard')} />
        )}

        {isAuthenticated && currentView === 'view-applications' && (
          <ViewApplications onBack={() => setCurrentView('dashboard')} />
        )}

        {isAuthenticated && currentView === 'services' && (
          <Services onBack={() => setCurrentView('dashboard')} />
        )}

        {isAuthenticated && currentView === 'private-search' && (
          <LoanSearch onBack={() => setCurrentView('dashboard')} />
        )}

        {/* Add this section for authenticated users to access LoanStatusCheck */}
        {isAuthenticated && currentView === 'status-check' && (
          <LoanStatusCheck 
            isAuthenticated={isAuthenticated}
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRegister={() => setCurrentView('register')}
          />
        )}

        {/* Add this section for authenticated users to access LoanSearch */}
        {isAuthenticated && currentView === 'loan-search' && (
          <LoanSearch onBack={() => setCurrentView('dashboard')} />
        )}
      </main>
    </div>
  );
}

export default App;