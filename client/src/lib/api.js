// In dev, VITE_API_URL is empty so Vite proxy handles /api/* → localhost:5000
// In production (Vercel), set VITE_API_URL to your Railway backend URL
const API = import.meta.env.VITE_API_URL ?? '';

export default API;
