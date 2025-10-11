const API_BASE_URL = import.meta.env.PROD
  ? 'https://land-regen.onrender.com' // ✅ Live backend
  : 'http://localhost:3000';           // ✅ Local dev

export default API_BASE_URL;