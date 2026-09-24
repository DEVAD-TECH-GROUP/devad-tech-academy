import { createContext, useContext, useEffect } from "react";
import useAuthStore from "../store/authStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, getMe, token } = useAuthStore();

  useEffect(() => {
    if (token && !user) getMe();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Keep the context consumer local so this module only exports the provider,
// allowing React Fast Refresh to track it correctly.
AuthProvider.useAuthContext = () => useContext(AuthContext);
