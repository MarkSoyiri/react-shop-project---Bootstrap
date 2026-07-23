import { useState, useCallback } from 'react';
import { API_BASE } from '../utils/helpers';

const getToken = () => localStorage.getItem('token');

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, path, data = null, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method,
        headers,
        ...options,
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
      const response = await fetch(url, config);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Request failed');
      }

      setLoading(false);
      return json;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const get = useCallback((path, options) => request('GET', path, null, options), [request]);
  const post = useCallback((path, data, options) => request('POST', path, data, options), [request]);
  const put = useCallback((path, data, options) => request('PUT', path, data, options), [request]);
  const patch = useCallback((path, data, options) => request('PATCH', path, data, options), [request]);
  const del = useCallback((path, options) => request('DELETE', path, null, options), [request]);

  return { get, post, put, patch, del, loading, error, request };
};

export default useApi;
