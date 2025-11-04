// Determine API URL based on environment
const getApiUrl = () => {
  // Check environment variable first
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim();
  }
  
  // Check current hostname for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'land-regen-1.onrender.com') {
      return 'https://land-regen.onrender.com';
    }
  }
  
  // Default for development
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;