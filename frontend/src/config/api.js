const API_BASE_URL = import.meta.env.PROD 
  ? 'https://land-regen-backend.onrender.com'
  : 'http://localhost:3000';

export default API_BASE_URL;