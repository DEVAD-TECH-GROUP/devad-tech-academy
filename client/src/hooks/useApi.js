import {
  useState,
  useCallback,
} from "react";

export default function useApi(fn) {
  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fn(...args);

        const responseData =
          res?.data?.data ?? res?.data ?? null;

        setData(responseData);

        return responseData;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong";

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return {
    data,
    loading,
    error,
    execute,

    // Useful for manually clearing an error
    clearError: () => setError(null),

    // Useful when a component needs to reset its data
    clearData: () => setData(null),
  };
}
