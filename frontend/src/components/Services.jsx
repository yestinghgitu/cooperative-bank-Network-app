import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';

const Services = ({ onBack }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={onBack}
        style={{ marginBottom: '20px', padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        ← Back to Dashboard
      </button>
      
      <h2>Our Banking Services</h2>
      <p style={{ marginBottom: '20px' }}>Discover our comprehensive range of financial products and services</p>
      
      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p>No services available at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {services.map((service) => (
            <div key={service.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2a5298' }}>{service.name}</h3>
              <p style={{ margin: '0 0 15px 0', color: '#666' }}>{service.description}</p>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Interest Rate: </strong>
                {service.interest_rate_min}% - {service.interest_rate_max}%
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Processing Time: </strong>
                {service.processing_time}
              </div>
              
              {service.features && (
                <div>
                  <strong>Features: </strong>
                  <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                    {service.features.split('\n').map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
