import React, { useState, useEffect } from 'react';
import { loanAPI } from '../services/api';

const ViewApplications = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await loanAPI.getApplications(searchTerm);
        setApplications(response.data.applications || response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [searchTerm]);

  const handleDuplicate = async (application) => {
    try {
      setDuplicatingId(application.id);
      
      // Create a copy of the application with a new ID and reset status
      const duplicatedApp = {
        ...application,
        id: null, // Let the backend generate a new ID
        applicationDate: new Date().toISOString(),
        status: 'pending',
        referenceNumber: `DUP-${application.referenceNumber || Date.now()}`
      };
      
      await loanAPI.createApplication(duplicatedApp);
      
      // Refresh the list
      const response = await loanAPI.getApplications(searchTerm);
      setApplications(response.data.applications || response.data || []);
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate application');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedApplications = React.useMemo(() => {
    let sortableItems = [...applications];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [applications, sortConfig]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  };

  // CSS styles
  const styles = {
    viewApplications: {
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '1200px',
      margin: '0 auto'
    },
    applicationsHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #e1e1e1',
      paddingBottom: '15px'
    },
    backButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#5a6268'
      }
    },
    heading: {
      color: '#343a40',
      margin: 0
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    controlsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    searchIcon: {
      position: 'absolute',
      left: '10px',
      color: '#6c757d'
    },
    searchInput: {
      padding: '8px 8px 8px 35px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      width: '250px',
      fontSize: '14px',
      '&:focus': {
        outline: 'none',
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
      }
    },
    resultsCount: {
      color: '#6c757d',
      fontSize: '14px'
    },
    tableContainer: {
      overflowX: 'auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      borderRadius: '8px',
      border: '1px solid #e1e1e1'
    },
    applicationsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      '& th': {
        padding: '12px 15px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: '2px solid #e1e1e1',
        '&:hover': {
          backgroundColor: '#e9ecef'
        }
      }
    },
    tableRow: {
      '&:nth-of-type(even)': {
        backgroundColor: '#f8f9fa'
      },
      '&:hover': {
        backgroundColor: '#e9ecef'
      }
    },
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #e1e1e1'
    },
    applicantName: {
      fontWeight: '500',
      color: '#343a40'
    },
    loanAmount: {
      fontWeight: '500',
      color: '#155724'
    },
    applicationDate: {
      color: '#6c757d'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    },
    statusApproved: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusRejected: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    statusPending: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    statusUnknown: {
      backgroundColor: '#e2e3e5',
      color: '#383d41'
    },
    referenceNumber: {
      fontFamily: 'monospace',
      color: '#6c757d'
    },
    duplicateButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '13px',
      transition: 'background-color 0.2s',
      '&:hover:not(:disabled)': {
        backgroundColor: '#138496'
      },
      '&:disabled': {
        opacity: 0.65,
        cursor: 'not-allowed'
      }
    },
    noData: {
      textAlign: 'center',
      padding: '30px',
      color: '#6c757d',
      fontStyle: 'italic'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#6c757d',
      fontSize: '18px'
    }
  };

  if (loading) {
    return (
      <div style={styles.viewApplications}>
        <div style={styles.loading}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div style={styles.viewApplications}>
      <div style={styles.applicationsHeader}>
        {onBack && (
          <button style={styles.backButton} onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        )}
        <h2 style={styles.heading}>Loan Applications</h2>
      </div>
      
      {error && <div style={styles.errorMessage}>Error: {error}</div>}
      
      <div style={styles.controlsRow}>
        <div style={styles.searchContainer}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.resultsCount}>
          {applications.length} application{applications.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      <div style={styles.tableContainer}>
        <table style={styles.applicationsTable}>
          <thead>
            <tr style={styles.tableHeader}>
              <th onClick={() => handleSort('applicantName')} style={styles.tableCell}>
                Applicant Name {sortConfig.key === 'applicantName' && (
                  <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('loanAmount')} style={styles.tableCell}>
                Loan Amount {sortConfig.key === 'loanAmount' && (
                  <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('applicationDate')} style={styles.tableCell}>
                Application Date {sortConfig.key === 'applicationDate' && (
                  <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('status')} style={styles.tableCell}>
                Status {sortConfig.key === 'status' && (
                  <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th style={styles.tableCell}>Reference Number</th>
              <th style={styles.tableCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.length === 0 ? (
              <tr>
                <td colSpan="6" style={{...styles.tableCell, ...styles.noData}}>
                  No applications found
                </td>
              </tr>
            ) : (
              sortedApplications.map((application) => (
                <tr key={application.id} style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.applicantName}}>
                    {application.applicantName || 'Unknown Applicant'}
                  </td>
                  <td style={{...styles.tableCell, ...styles.loanAmount}}>
                    ${application.loanAmount}
                  </td>
                  <td style={{...styles.tableCell, ...styles.applicationDate}}>
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      ...styles[getStatusBadgeClass(application.status)]
                    }}>
                      {application.status}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, ...styles.referenceNumber}}>
                    {application.referenceNumber || 'N/A'}
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.duplicateButton}
                      onClick={() => handleDuplicate(application)}
                      disabled={duplicatingId === application.id}
                      title="Duplicate application"
                    >
                      {duplicatingId === application.id ? (
                        <><i className="fas fa-spinner fa-spin"></i> Duplicating...</>
                      ) : (
                        <><i className="fas fa-copy"></i> Duplicate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewApplications; 