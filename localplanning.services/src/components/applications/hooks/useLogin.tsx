import { useState } from "react";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";
import { navigate } from "astro:transitions/client";

type UseLogin = () => {
  login: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogin: UseLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lps/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.status}`);
      }
      navigate("/applications/check-your-inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError
  };
};