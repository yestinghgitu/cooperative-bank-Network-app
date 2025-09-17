// components/LoanStatusCheck.jsx
import React, { useState } from 'react';
import { loanAPI } from '../services/api';

const LoanStatusCheck = ({ isAuthenticated = false, onNavigateToLogin, onNavigateToRegister }) => {
    const [searchData, setSearchData] = useState({
        aadharNumber: '',
        mobileNumber: '',
        firstName: '',
        lastName: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(false);
        
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
            
            // Use public search API regardless of authentication status
            const response = await loanAPI.searchApplicationsPublic(searchParams);
            setSearchResults(response.data.applications || []);
            setSearched(true);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to search applications. Please try again.';
            setError(errorMessage);
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

    const clearSearch = () => {
        setSearchData({
            aadharNumber: '',
            mobileNumber: '',
            firstName: '',
            lastName: ''
        });
        setSearchResults([]);
        setError('');
        setSearched(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Loan Application Status Check</h2>
            
            {/* Always show search form regardless of authentication status */}
            <>
                <p>Check your loan application status using your details</p>
                
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
                                maxLength="12"
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
                                maxLength="10"
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
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                flex: 1
                            }}
                        >
                            {loading ? 'Searching...' : 'Search Application'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={clearSearch}
                            style={{
                                padding: '10px 20px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '15px', 
                        padding: '10px',
                        background: '#fff5f5',
                        border: '1px solid #fed7d7',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Search Results */}
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
                                    <p><strong>Loan Type:</strong> {app.loan_type}</p>
                                    <p><strong>Amount:</strong> ₹{app.loan_amount?.toLocaleString()}</p>
                                    <p><strong>Status:</strong> 
                                        <span style={{
                                            color: app.status === 'Approved' ? 'green' : 
                                                   app.status === 'Rejected' ? 'red' : 'orange',
                                            fontWeight: 'bold',
                                            marginLeft: '5px'
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

                {searched && searchResults.length === 0 && !loading && (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        marginTop: '20px',
                        padding: '20px',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px'
                    }}>
                        No applications found matching your search criteria.
                    </div>
                )}
            </>

            {/* Show login prompt only if not authenticated */}
            {!isAuthenticated && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h3>Login for more features</h3>
                    <p>Create an account or login to access additional features like applying for new loans, saving your information, and getting personalized recommendations.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                        <button 
                            onClick={onNavigateToLogin}
                            style={{
                                padding: '10px 20px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Login
                        </button>
                        
                        <button 
                            onClick={onNavigateToRegister}
                            style={{
                                padding: '10px 20px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Create New Account
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '4px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>With an account, you can:</p>
                        <ul style={{ textAlign: 'left', margin: '10px 0 0 0', paddingLeft: '20px' }}>
                            <li>Apply for new loans quickly</li>
                            <li>Save your information for faster applications</li>
                            <li>Get personalized loan recommendations</li>
                            <li>Track all your applications in one place</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanStatusCheck;