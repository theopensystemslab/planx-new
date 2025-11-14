import { useQuery } from "@tanstack/react-query";
import {
  downloadApplicationHtml,
  getDownloadToken,
} from "lib/api/saveAndReturn/requests";

interface UseDownloadApplicationProps {
  email: string | undefined;
  sessionId: string;
}

/**
 * Hook to download application HTML
 * Follows the same pattern as the LPS useHtmlDownload hook
 */
export const useDownloadApplication = ({
  email,
  sessionId,
}: UseDownloadApplicationProps) => {
  let inputError: Error | null = null;
  if (!email) {
    inputError = new Error("Missing email value");
  } else if (!sessionId) {
    inputError = new Error("Missing sessionId value");
  }

  // Step 1: Get access token
  const tokenQuery = useQuery({
    queryKey: ["downloadToken", email, sessionId],
    queryFn: async () => {
      if (!email || !sessionId) {
        throw new Error("Missing required parameters");
      }
      return getDownloadToken(email, sessionId);
    },
    enabled: !!email && !!sessionId,
    staleTime: Infinity,
  });

  // Step 2: Use token to fetch HTML
  const htmlQuery = useQuery({
    queryKey: ["downloadHtml", email, sessionId],
    queryFn: async () => {
      const token = tokenQuery.data;
      if (!token || !email || !sessionId) {
        throw new Error("Missing required parameters");
      }
      return downloadApplicationHtml(email, sessionId, token);
    },
    enabled: !!tokenQuery.data,
    staleTime: Infinity,
  });
  
  return {
    data: htmlQuery.data,
    isPending: tokenQuery.isPending || htmlQuery.isPending,
    error: inputError || tokenQuery.error || htmlQuery.error,
  };
};

