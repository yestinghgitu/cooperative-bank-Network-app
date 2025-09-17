import React from 'react';

const NavBar = ({ userName, onLogout, onNavigate }) => {
  return (
    <nav style={{ 
      background: '#343a40', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
        Cooperative Bank Network - Welcome, {userName}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => onNavigate('dashboard')}
          style={{ 
            background: 'none', 
            border: '1px solid #6c757d', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#6c757d';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          Dashboard
        </button>
        
        <button 
          onClick={() => onNavigate('create-loan')}
          style={{ 
            background: 'none', 
            border: '1px solid #6c757d', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#6c757d';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          Apply for Loan
        </button>
        
        <button 
          onClick={() => onNavigate('private-search')}
          style={{ 
            background: 'none', 
            border: '1px solid #6c757d', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#6c757d';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          Search Applications
        </button>
        
        <button 
          onClick={() => onNavigate('view-applications')}
          style={{ 
            background: 'none', 
            border: '1px solid #6c757d', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#6c757d';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          My Applications
        </button>
        
        <button 
          onClick={() => onNavigate('services')}
          style={{ 
            background: 'none', 
            border: '1px solid #6c757d', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#6c757d';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          Services
        </button>
        
        <button 
          onClick={onLogout}
          style={{ 
            background: '#dc3545', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#c82333';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#dc3545';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;