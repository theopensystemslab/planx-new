import { queryClient } from "@lib/queryClient";
import { useStore } from "@nanostores/react";
import { $applicationId } from "@stores/applicationId";
import { $session } from "@stores/session";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";

export const useHtmlDownload = () => {
  const { email } = useStore($session);
  const applicationId = useStore($applicationId);

  let inputError: Error | null = null;
  if (!email) {
    inputError = new Error("Missing email value from store");
  } else if (!applicationId) {
    inputError = new Error("Missing applicationId value from store");
  }

  // Step 1: Get access token
  const tokenQuery = useQuery(
    {
      queryKey: ["downloadToken", email, applicationId],
      queryFn: async () => {
        const response = await fetch(
          `${PUBLIC_PLANX_REST_API_URL}/lps/download/token`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, sessionId: applicationId }),
          },
        );
        if (!response.ok)
          throw new Error(`Token request failed: ${response.status}`);
        const { token } = await response.json();
        return token;
      },
      enabled: !!email && !!applicationId,
      // The token is single use, do not refetch unless invalidated
      staleTime: Infinity,
    },
    queryClient,
  );

  // Step 2: Use token to fetch HTML
  const htmlQuery = useQuery(
    {
      queryKey: ["downloadHtml", email, applicationId, tokenQuery.data],
      queryFn: async () => {
        const token = tokenQuery.data;
        const response = await fetch(
          `${PUBLIC_PLANX_REST_API_URL}/lps/download/html`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ email, sessionId: applicationId }),
          },
        );
        if (!response.ok)
          throw new Error(`HTML request failed: ${response.status}`);
        return response.text();
      },
      enabled: !!tokenQuery.data,
      // Never refetch HTML once we have a copy in the cache
      staleTime: Infinity,
    },
    queryClient,
  );

  const refetchAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["downloadToken", email, applicationId],
    });
    queryClient.invalidateQueries({
      queryKey: ["downloadHtml", email, applicationId],
    });
  };

  return {
    data: htmlQuery.data,
    isPending: tokenQuery.isPending || htmlQuery.isPending,
    error: inputError || tokenQuery.error || htmlQuery.error,
    refetch: refetchAll,
  };
};
