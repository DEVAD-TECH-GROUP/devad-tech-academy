import { createContext, useContext, useEffect } from "react";
import useThemeStore from "../store/themeStore";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);