import { createContext, useContext, useEffect, useState } from 'react';
import { apiJson } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson('/api/auth/csrf/')
      .then(() => apiJson('/api/auth/me/'))
      .then((data) => {
        if (data.authenticated) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await apiJson('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await apiJson('/api/auth/logout/', { method: 'POST' });
    localStorage.removeItem('search_history');
    localStorage.removeItem('employer_app_search_history');
    setUser(null);
  };

  const register = async (fields) => {
    const data = await apiJson('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
