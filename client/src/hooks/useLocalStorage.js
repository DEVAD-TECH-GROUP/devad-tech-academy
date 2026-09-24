import { useState } from "react";

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  const set = (val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  const remove = () => {
    setValue(initial);
    localStorage.removeItem(key);
  };

  return [value, set, remove];
}
