// components/LoanSearch.jsx
import React, { useState } from 'react';
import { loanAPI } from '../services/api';

const LoanSearch = () => {
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
            if (searchData.aadharNumber.trim() !== '') {
                searchParams.aadharNumber = searchData.aadharNumber;
            }
            if (searchData.mobileNumber.trim() !== '') {
                searchParams.mobileNumber = searchData.mobileNumber;
            }
            if (searchData.firstName.trim() !== '') {
                searchParams.firstName = searchData.firstName;
            }
            if (searchData.lastName.trim() !== '') {
                searchParams.lastName = searchData.lastName;
            }
            
            // Check if at least one search parameter is provided
            if (Object.keys(searchParams).length === 0) {
                setError('Please provide at least one search parameter');
                setLoading(false);
                return;
            }
            
            // Use the private search endpoint for authenticated users
            const response = await loanAPI.searchApplicationsPrivate(searchParams);
            setSearchResults(response.data.applications || []);
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
        // Basic validation for Aadhar and Mobile numbers
        if (name === 'aadharNumber' && value.length > 12) return;
        if (name === 'mobileNumber' && value.length > 10) return;
        
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
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Loan Application Search</h2>
            <p>Check your loan application status</p>
            
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
                            pattern="[0-9]{12}"
                            title="Aadhar number must be 12 digits"
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
                            pattern="[0-9]{10}"
                            title="Mobile number must be 10 digits"
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

            {searchResults.length === 0 && !loading && (
                <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    marginTop: '20px',
                    padding: '20px',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                }}>
                    No applications found. Please search with your details.
                </div>
            )}
        </div>
    );
};

export default LoanSearch;