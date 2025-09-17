import React, { useState, useEffect } from 'react';
import { loanAPI } from '../services/api';

const ViewApplications = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await loanAPI.updateApplicationStatus(id, status);
      // Refresh the applications list by re-fetching
      const response = await loanAPI.getApplications(searchTerm);
      setApplications(response.data.applications || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="view-applications">
      <div className="header">
        {onBack && (
          <button onClick={onBack} className="back-button">
            &larr; Back
          </button>
        )}
        <h2>Loan Applications</h2>
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      
      <div className="applications-list">
        {applications.length === 0 ? (
          <div>No applications found</div>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="application-card">
              <h3>{application.applicantName || 'Unknown Applicant'}</h3>
              <p>Loan Amount: ${application.loanAmount}</p>
              <p>Status: {application.status}</p>
              <div className="action-buttons">
                <button 
                  onClick={() => handleStatusUpdate(application.id, 'approved')}
                  disabled={application.status === 'approved'}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                  disabled={application.status === 'rejected'}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewApplications;