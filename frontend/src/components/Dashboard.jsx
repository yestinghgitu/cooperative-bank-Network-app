import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_loans: 0,
    active_accounts: 5892,
    total_deposits: 45.2,
    pending_applications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await dashboardAPI.getStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Cooperative Bank Network</h1>
        <p>Hello {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : 'User'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Loans</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{stats.total_loans}</p>
          <p style={{ color: 'green', margin: 0 }}>+12% from last month</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Active Accounts</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{stats.active_accounts.toLocaleString()}</p>
          <p style={{ color: 'green', margin: 0 }}>+8% from last month</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Deposits</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>₹{stats.total_deposits}Cr</p>
          <p style={{ color: 'green', margin: 0 }}>+15% from last month</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Pending Applications</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{stats.pending_applications}</p>
          <p style={{ color: 'red', margin: 0 }}>+5% from last month</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('create-loan')}
            style={{ padding: '12px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Create Loan
          </button>
          <button 
            onClick={() => onNavigate('view-applications')}
            style={{ padding: '12px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            View Applications
          </button>
          <button 
            onClick={() => onNavigate('services')}
            style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            View Services
          </button>
        </div>
      </div>

      {/* Added Traditional Application Card */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Loan Application Methods</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          <div 
            className="action-card" 
            onClick={() => onNavigate('loan-application-form')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="action-icon" style={{ fontSize: '24px', marginRight: '15px' }}>📝</div>
            <div className="action-content" style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0' }}>Traditional Application</h3>
              <p style={{ margin: 0, color: '#666' }}>Use our traditional form application</p>
            </div>
            <div className="action-arrow" style={{ fontSize: '20px' }}>→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;