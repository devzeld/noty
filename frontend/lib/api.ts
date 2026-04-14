const BASE_URL = "http://localhost:3306";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {

    const config: RequestInit = {
    ...options,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response = await fetch(`${BASE_URL}/src/${endpoint}`, config);

  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include', 
      });

      if (refreshResponse.ok) {
        response = await fetch(`${BASE_URL}/src/${endpoint}`, config);
      } else {
        throw new Error('Refresh fallito');
      }
    } catch (error) {
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }

  return response;
};