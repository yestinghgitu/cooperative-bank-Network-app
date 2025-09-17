import React, { useState } from 'react';
import { loanAPI, uploadAPI } from '../services/api';

const CreateLoan = ({ onBack }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    aadhar_number: '',
    mobile_number: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    loan_type: 'Personal',
    loan_amount: '',
    photo_url: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first');
      return null;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      const response = await uploadAPI.uploadPhoto(formData);
      setIsUploading(false);
      setMessage('Photo uploaded successfully!');
      return response.data.photo_url;
    } catch (error) {
      setIsUploading(false);
      setMessage('Error uploading photo: ' + (error.response?.data?.error || 'Please try again.'));
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate passwords match
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload photo first if selected
      let photoUrl = formData.photo_url;
      if (selectedFile) {
        photoUrl = await handlePhotoUpload();
        if (!photoUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Format the date before sending to backend
      const formatDateForBackend = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const dataToSend = {
        ...formData,
        date_of_birth: formatDateForBackend(formData.date_of_birth),
        photo_url: photoUrl
      };
      
      // Remove confirmPassword from the data sent to backend
      delete dataToSend.confirmPassword;
      
      const response = await loanAPI.createApplication(dataToSend);
      setMessage(`Loan application submitted successfully! Application ID: ${response.data.application_id}`);
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        aadhar_number: '',
        mobile_number: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        loan_type: 'Personal',
        loan_amount: '',
        photo_url: '',
        password: '',
        confirmPassword: ''
      });
      setSelectedFile(null);
    } catch (error) {
      setMessage('Error submitting application: ' + (error.response?.data?.error || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        ← Back to Dashboard
      </button>
      
      <h2>Create Loan Application</h2>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          background: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Aadhar Number *</label>
            <input
              type="text"
              name="aadhar_number"
              value={formData.aadhar_number}
              onChange={handleInputChange}
              required
              maxLength="12"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mobile Number *</label>
            <input
              type="tel"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleInputChange}
              required
              maxLength="10"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              maxLength="6"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {isUploading && <p style={{ margin: '5px 0', color: '#007bff' }}>Uploading photo...</p>}
          {selectedFile && !isUploading && (
            <p style={{ margin: '5px 0', color: '#28a745' }}>File selected: {selectedFile.name}</p>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Loan Type *</label>
            <select
              name="loan_type"
              value={formData.loan_type}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="Personal">Personal Loan</option>
              <option value="Home">Home Loan</option>
              <option value="Vehicle">Vehicle Loan</option>
              <option value="Education">Education Loan</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Loan Amount (₹) *</label>
            <input
              type="number"
              name="loan_amount"
              value={formData.loan_amount}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>

        
        
        <button 
          type="submit" 
          disabled={isSubmitting || isUploading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: (isSubmitting || isUploading) ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: (isSubmitting || isUploading) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : isUploading ? 'Uploading...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default CreateLoan;