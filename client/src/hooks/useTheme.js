import useThemeStore from "../store/themeStore";

export default function useTheme() {
  const { theme, toggleTheme } = useThemeStore();
  return { theme, toggleTheme, isDark: theme === "dark" };
}
