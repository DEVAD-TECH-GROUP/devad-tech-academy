import {
  createContext,
  useContext,
  useEffect,
} from "react";

import useAuthStore from "../store/authStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  const authInitialized = useAuthStore(
    (state) => state.authInitialized
  );

  // ============================================================
  // INITIALIZE AUTH ON APPLICATION START
  // ============================================================

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// AUTH CONTEXT HOOK
// ============================================================

AuthProvider.useAuthContext = () =>
  useContext(AuthContext);

export const useAuthContext = () =>
  useContext(AuthContext);
