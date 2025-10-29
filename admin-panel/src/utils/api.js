import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

let accessToken = null;
let refreshToken = null;
let unauthorizedCallback = null;

const subscribers = [];
let isRefreshing = false;

const onRefreshed = (token) => {
  subscribers.splice(0).forEach((callback) => callback(token));
};

const subscribeTokenRefresh = (callback) => {
  subscribers.push(callback);
};

export const setAuthTokens = (token, refresh) => {
  accessToken = token;
  refreshToken = refresh;
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedCallback = handler;
};

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};

    if (status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${newToken}`
            };
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const newAccessToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken || refreshToken;

        accessToken = newAccessToken;
        refreshToken = newRefreshToken;
        onRefreshed(newAccessToken);

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccessToken}`
        };
        return api(originalRequest);
      } catch (refreshError) {
        onRefreshed(null);
        clearAuthTokens();
        if (unauthorizedCallback) {
          unauthorizedCallback();
        }
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

export const fetchDashboardMetrics = async (params = {}) => {
  const { data } = await api.get('/admin/stats', { params });
  return data;
};

export const fetchVictims = async (params = {}) => {
  const { data } = await api.get('/admin/victims', { params });
  return data;
};

export const fetchCoupons = async (params = {}) => {
  const { data } = await api.get('/admin/coupons', { params });
  return data;
};

export const updateCoupon = async (payload) => {
  const { data } = await api.post('/admin/coupons', payload);
  return data;
};

export const fetchAnalyticsOverview = async (params = {}) => {
  try {
    const { data } = await api.get('/analytics/overview', { params });
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const fallback = await fetchDashboardMetrics(params);
      return {
        totals: {
          views: fallback.totalViews ?? fallback.views ?? 0,
          clicks: fallback.totalClicks ?? fallback.clicks ?? 0,
          submits: fallback.totalSubmits ?? fallback.submits ?? 0
        }
      };
    }
    throw error;
  }
};

export const fetchSecuritySettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data;
};

export const updateSecuritySettings = async (payload) => {
  const { data } = await api.put('/admin/settings', payload);
  return data;
};

export const generateBackupCodes = async () => {
  const { data } = await api.post('/admin/settings/backup-codes');
  return data;
};

export default api;
