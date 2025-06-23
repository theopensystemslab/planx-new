import { useState } from "react";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";
import { navigate } from "astro:transitions/client";

type UseResumeApplication = () => {
  submitEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface ResumeAPIResponse {
  message: string;
}

export const useResumeApplication: UseResumeApplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/resume-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // TODO: PlanX API currently requires a team name
        body: JSON.stringify({ payload: email })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.statusText}`);
      }

      const data: ResumeAPIResponse = await response.json();
      // TEMP: Remove once PlanX API updated
      console.log({ data });

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
    submitEmail,
    isLoading,
    error,
    clearError
  };
};