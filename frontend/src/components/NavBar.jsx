import React from 'react';

const NavBar = ({ userName, onLogout }) => {
  return (
    <header style={{ background: '#f8f9fa', padding: '15px', borderBottom: '1px solid #dee2e6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Cooperative Bank Network</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <p style={{ margin: 0 }}>Welcome, {userName}</p>
          <button 
            onClick={onLogout}
            style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;