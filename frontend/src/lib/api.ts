import axios from 'axios';

let cachedCsrfToken: string | null = null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Send HttpOnly cookies automatically
});

api.interceptors.request.use(async (config: any) => {
  // For state-changing requests, attach CSRF token header
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    if (!cachedCsrfToken) {
      try {
        const res: any = await axios.get(`${config.baseURL}/csrf-token`, { withCredentials: true });
        cachedCsrfToken = res.data?.csrfToken || null;
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    }
    if (cachedCsrfToken) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = cachedCsrfToken;
    }
  }
  return config;
});

export default api;


