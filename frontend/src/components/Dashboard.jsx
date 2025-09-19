import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_loans: 0,
    pending_applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 5px 0', 
            color: '#1e3c72',
            fontSize: '28px'
          }}>
            Cooperative Bank Network
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#666',
            fontSize: '16px'
          }}>
            Hello user, welcome back!
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '5px'
          }}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: '#1e3c72'
          }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Total Loans Card */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #4e73df'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#5a5c69',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Total Loans
              </h3>
              <p style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                margin: '0 0 5px 0',
                color: '#2e59d9'
              }}>
                {stats.total_loans.toLocaleString()}
              </p>
              <p style={{ 
                color: '#1cc88a', 
                margin: 0,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ↑ +12% from last month
              </p>
            </div>
            <div style={{ 
              fontSize: '32px', 
              color: '#dddfeb',
              background: '#4e73df',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px'
            }}>
              💰
            </div>
          </div>
        </div>

        {/* Our Services Card */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1cc88a'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#5a5c69',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Our Services
              </h3>
              <p style={{ 
                fontSize: '14px', 
                margin: '0 0 5px 0',
                color: '#858796',
                lineHeight: '1.4'
              }}>
                Letter pads • Banking Software • Auditing • Legal services
              </p>
              <p style={{ 
                color: '#1cc88a', 
                margin: 0,
                fontSize: '14px',
                fontWeight: '500'
              }}>

                Explore our comprehensive offerings
              </p>
            </div>
            <div style={{ 
              fontSize: '32px', 
              color: '#dddfeb',
              background: '#1cc88a',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px'
            }}>
              🏦
            </div>
          </div>
        </div>

        {/* Pending Applications Card */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f6c23e'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#5a5c69',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Pending Applications
              </h3>
              <p style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                margin: '0 0 5px 0',
                color: '#f6c23e'
              }}>
                {stats.pending_applications}
              </p>
              <p style={{ 
                color: '#e74a3b', 
                margin: 0,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ↑ +5% from last month
              </p>
            </div>
            <div style={{ 
              fontSize: '32px', 
              color: '#dddfeb',
              background: '#f6c23e',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px'
            }}>
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#5a5c69',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <button 
            onClick={() => onNavigate('create-loan')}
            style={{ 
              padding: '15px 20px', 
              background: 'linear-gradient(135deg, #4e73df, #2e59d9)',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>📝</span>
            Create Loan
          </button>
          
          <button 
            onClick={() => onNavigate('view-applications')}
            style={{ 
              padding: '15px 20px', 
              background: 'linear-gradient(135deg, #1cc88a, #17a673)',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>👁️</span>
            View Applications
          </button>
          
          <button 
            onClick={() => onNavigate('services')}
            style={{ 
              padding: '15px 20px', 
              background: 'linear-gradient(135deg, #36b9cc, #2c9faf)',
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>🏦</span>
            View Services
          </button>
        </div>
      </div>

      {/* Application Methods Section */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#5a5c69',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Application Methods
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {/* Search Applications Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              border: '1px solid #e3e6f0',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onNavigate('private-search')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                marginRight: '15px',
                background: '#4e73df',
                color: 'white',
                borderRadius: '8px',
                padding: '10px'
              }}>
                🔍
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#4e73df' }}>Search Applications</h4>
                <p style={{ margin: 0, color: '#858796', fontSize: '14px' }}>Search and view loan application details</p>
              </div>
            </div>
          </div>

          {/* Traditional Application Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              border: '1px solid #e3e6f0',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onNavigate('create-loan')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                marginRight: '15px',
                background: '#1cc88a',
                color: 'white',
                borderRadius: '8px',
                padding: '10px'
              }}>
                📝
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1cc88a' }}>Traditional Application</h4>
                <p style={{ margin: 0, color: '#858796', fontSize: '14px' }}>Use our traditional form application</p>
              </div>
            </div>
          </div>

          {/* Apply for Loan Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              border: '1px solid ',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onNavigate('create-loan')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                marginRight: '15px',
                background: '#36b9cc',
                color: 'white',
                borderRadius: '8px',
                padding: '10px'
              }}>
                💰
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#36b9cc' }}>Apply for Loan</h4>
                <p style={{ margin: 0, color: '#858796', fontSize: '14px' }}>Submit a new loan application</p>
              </div>
            </div>
          </div>

          {/* My Applications Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              border: '1px solid #e3e6f0',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onNavigate('view-applications')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                marginRight: '15px',
                background: '#f6c23e',
                color: 'white',
                borderRadius: '8px',
                padding: '10px'
              }}>
                📋
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#f6c23e' }}>My Applications</h4>
                <p style={{ margin: 0, color: '#858796', fontSize: '14px' }}>View your submitted loan applications</p>
              </div>
            </div>
          </div>

          {/* Bank Services Card */}
          <div 
            style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              border: '1px solid #e3e6f0',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onNavigate('services')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                marginRight: '15px',
                background: '#e74a3b',
                color: 'white',
                borderRadius: '8px',
                padding: '10px'
              }}>
                🏦
              </div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#e74a3b' }}>Bank Services</h4>
                <p style={{ margin: 0, color: '#858796', fontSize: '14px' }}>Explore our banking services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;