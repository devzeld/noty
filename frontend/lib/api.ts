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

  // AGGIUNGIAMO QUESTI DUE LOG PER SPIARE LA CHIAMATA:
  console.log("URL CHE STO CHIAMANDO:", `${BASE_URL}${endpoint}`);
  console.log("CONFIGURAZIONE:", config);

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  const isAuthRoute = endpoint.includes('/login.php') || endpoint.includes('/register.php');

  if (response.status === 401 && !isAuthRoute) {
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
      
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(error);
    }
  }

  return response;
};