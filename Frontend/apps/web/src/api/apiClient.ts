import axios from 'axios';
import { loadingController } from '../contexts/LoadingContext';

// Extend axios config to support opting out of the global loader
declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalLoader?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipGlobalLoader?: boolean;
  }
}
const API_URL = import.meta.env.VITE_API_URL || 'https://api-s2.vault.musahm.com';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5042';


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication to prevent duplicate API calls
const pendingRequests = new Map<string, number>();

const generateRequestKey = (config: any): string => {
  return `${config.method}-${config.url}-${JSON.stringify(config.data || {})}-${JSON.stringify(config.params || {})}`;
};

// Add request deduplication interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (!config.skipGlobalLoader) {
      loadingController.increment();
    }
    // Only deduplicate non-GET requests (mutations) to prevent double-submit
    // GET requests are allowed to repeat to let multiple components fetch data
    if (config.method?.toLowerCase() === 'get') {
      return config;
    }

    const requestKey = generateRequestKey(config);
    const now = Date.now();
    const lastRequestTime = pendingRequests.get(requestKey);

    // If same mutation was made less than 1 second ago, reject it
    if (lastRequestTime && now - lastRequestTime < 1000) {
      console.warn('Duplicate mutation blocked:', requestKey);
      return Promise.reject(new axios.Cancel('Duplicate request cancelled'));
    }

    // Store this request timestamp
    pendingRequests.set(requestKey, now);

    // Clean up after 2 seconds
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, 2000);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add token and language to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Send the current selected language to the backend
    const language = localStorage.getItem('language') || 'ar';
    config.headers['Accept-Language'] = language;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => {
    if (!response.config?.skipGlobalLoader) {
      loadingController.decrement();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipGlobalLoader) {
      loadingController.decrement();
    }
    // Check if it's a 401 error
    if (error.response?.status === 401) {
      // Check if the request was a login request or we are already on the login page
      // We don't want to reload the page in these cases
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/api/Auth/');
      const authPages = ['/login', '/login/admin', '/login/adminP', '/registration', '/forgot-password', '/reset-password'];
      const isAuthPage = authPages.some(p => window.location.pathname.startsWith(p));

      if (isAuthRequest || isAuthPage) {
        // Just reject the promise so the calling code can handle the error (show message etc)
        // do not redirect
        return Promise.reject(error);
      }

      // Clear all auth-related data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }

    // MUS-724: Handle 403 Forbidden — likely expired/stale token permissions
    if (error.response?.status === 403) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/api/Auth/');
      const authPages = ['/login', '/login/admin', '/login/adminP', '/registration', '/forgot-password', '/reset-password'];
      const isAuthPage = authPages.some(p => window.location.pathname.startsWith(p));

      if (!isAuthRequest && !isAuthPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
