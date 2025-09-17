// components/LoanSearchPrivate.jsx
import React, { useState } from 'react';
import { loanAPI } from '../services/api';

const LoanSearchPrivate = () => {
    const [searchData, setSearchData] = useState({
        aadharNumber: '',
        mobileNumber: '',
        firstName: '',
        lastName: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Remove empty fields from search
            const searchParams = {};
            Object.keys(searchData).forEach(key => {
                if (searchData[key].trim() !== '') {
                    searchParams[key] = searchData[key];
                }
            });
            
            // Check if at least one search parameter is provided
            if (Object.keys(searchParams).length === 0) {
                setError('Please provide at least one search parameter');
                setLoading(false);
                return;
            }
            
            const response = await loanAPI.getApplications(searchParams);
            setSearchResults(response.data.applications || []);
        } catch (err) {
            setError('Failed to search applications. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Loan Application Search (Private)</h2>
            <p>Search loan applications with detailed information</p>
            
            <form onSubmit={handleSearch} style={{ 
                background: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label>Aadhar Number:</label>
                        <input
                            type="text"
                            name="aadharNumber"
                            value={searchData.aadharNumber}
                            onChange={handleInputChange}
                            placeholder="Enter Aadhar number"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                    <div>
                        <label>Mobile Number:</label>
                        <input
                            type="text"
                            name="mobileNumber"
                            value={searchData.mobileNumber}
                            onChange={handleInputChange}
                            placeholder="Enter mobile number"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                    <div>
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={searchData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={searchData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Searching...' : 'Search Application'}
                </button>
            </form>

            {error && (
                <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>
            )}

            {searchResults.length > 0 && (
                <div>
                    <h3>Search Results:</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {searchResults.map(app => (
                            <div key={app.id} style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                borderRadius: '4px',
                                background: 'white'
                            }}>
                                <h4>Application ID: {app.application_id}</h4>
                                <p><strong>Name:</strong> {app.first_name} {app.last_name}</p>
                                <p><strong>Mobile:</strong> {app.mobile_number}</p>
                                <p><strong>Email:</strong> {app.email || 'N/A'}</p>
                                <p><strong>City:</strong> {app.city || 'N/A'}</p>
                                <p><strong>Loan Type:</strong> {app.loan_type}</p>
                                <p><strong>Amount:</strong> ₹{app.loan_amount}</p>
                                <p><strong>Status:</strong> 
                                    <span style={{
                                        color: app.status === 'Approved' ? 'green' : 
                                               app.status === 'Rejected' ? 'red' : 'orange',
                                        fontWeight: 'bold'
                                    }}>
                                        {app.status}
                                    </span>
                                </p>
                                <p><strong>Applied on:</strong> {new Date(app.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                    No applications found. Please search with your details.
                </div>
            )}
        </div>
    );
};

export default LoanSearchPrivate;