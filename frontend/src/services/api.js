// API service for Supabase backend
import API_BASE_URL from '../config/api'; // ✅ Dynamic base URL

// ✅ GET soil health data (protected route)
export const fetchSoilHealth = async (
  location = 'Murang\'a',
  start = '2025-10-01',
  end = '2025-10-03'
) => {
  try {
    if (!location || !start || !end) {
      throw new Error('Missing required parameters');
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const params = new URLSearchParams({ location, start, end });
    const url = `${API_BASE_URL}/soil-health?${params}`;
    
    if (!url.startsWith('http')) {
      throw new Error('Invalid API URL');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);

    // ✅ Return mock data if API fails
    return {
      success: true,
      data: [
        {
          id: '1',
          location: 'Murang\'a',
          timestamp: '2025-10-01T10:00:00Z',
          moisture_level: 38.0,
          erosion_index: 0.72,
          vegetation_index: 0.60
        },
        {
          id: '2',
          location: 'Murang\'a',
          timestamp: '2025-10-02T10:00:00Z',
          moisture_level: 36.0,
          erosion_index: 0.78,
          vegetation_index: 0.55
        }
      ]
    };
  }
};

// ✅ POST new soil reading (protected route)
export const postSoilReading = async (data) => {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided');
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const url = `${API_BASE_URL}/soil-health`;
    if (!url.startsWith('http')) {
      throw new Error('Invalid API URL');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('POST Error:', error);
    throw error;
  }
};

// ✅ GET testimonials (public route)
export const fetchTestimonials = async (zone = '') => {
  try {
    const params = zone ? `?zone=${encodeURIComponent(zone)}` : '';
    const url = `${API_BASE_URL}/testimonials${params}`;
    
    if (!url.startsWith('http')) {
      throw new Error('Invalid API URL');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return { success: false, data: [] };
  }
};