import { useState, useCallback } from "react";

/**
 * Hook to wrap API calls with loading and error handling.
 * Works great with the loanAPI.safe* methods.
 */
export default function useApiLoader() {
  const [loading, setLoading] = useState(false);

  const runWithLoader = useCallback(async (apiFunc) => {
    setLoading(true);
    try {
      const result = await apiFunc();
      return result;
    } catch (err) {
      // error handled inside api.js with toast
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, runWithLoader };
}
