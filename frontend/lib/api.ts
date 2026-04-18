const BASE_URL = "http://localhost/noty/backend/src";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {

    const config: RequestInit = {
    ...options,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh.php`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        response = await fetch(`${BASE_URL}${endpoint}`, config);
      } else {
        throw new Error('Refresh fallito');
      }
    } catch (error) {
      const currentPath = window.location.pathname;
      
      if (!currentPath.includes('/login')) {
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(error);
    }
  }

  return response;
};