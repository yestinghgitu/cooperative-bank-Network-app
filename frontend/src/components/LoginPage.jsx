import React, { useState } from 'react';
import { authAPI } from '../services/api';

// Header component for the login/signup buttons
const AuthHeader = ({ setShowLogin, setShowSignup }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <button
        style={{ marginRight: '10px', padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => setShowLogin(true)}
      >
        Login Bank Branch
      </button>
      <button
        style={{ padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => setShowSignup(true)}
      >
        Create New Account
      </button>
    </div>
  );
};

// Your existing Login component remains unchanged
const Login = ({ onLogin, onSwitchRegister, onPublicSearch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.username);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏦</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Cooperative Bank Network</h2>
          <p style={{ margin: 0, color: '#666' }}>Welcome back! Please sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2a5298, #1e3c72)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            <strong>Demo Credentials:</strong><br />
            Username: <code>3921</code><br />
            Password: <code>3921</code>
          </p>
          <div style={{ marginTop: '15px' }}>
              <button 
                  onClick={onSwitchRegister}
                  style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      marginRight: '15px'
                            }}
                        >
                          Create New Account
                        </button>


          <button 
            onClick={onPublicSearch}
            style={{
              background: 'none',
                                border: 'none',
                                color: '#28a745',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px'
            }}
          >
            Check Loan Application Status
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

// Export both components
export { AuthHeader };
export default Login;