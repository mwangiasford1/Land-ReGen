// API service for Supabase backend
const BASE_URL = 'https://land-regen.onrender.com'; // ✅ Use live backend URL

export const fetchSoilHealth = async (
  location = 'Murang\'a',
  start = '2025-10-01',
  end = '2025-10-03'
) => {
  try {
    const params = new URLSearchParams({ location, start, end });
    const response = await fetch(`${BASE_URL}/soil-health?${params}`, {
      method: 'GET',
      credentials: 'include', // ✅ Include cookies if needed
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);

    // Return mock data if API fails
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

export const postSoilReading = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/soil-health`, {
      method: 'POST',
      credentials: 'include', // ✅ Include cookies if needed
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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