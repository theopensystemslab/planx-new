import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "./useSearchParams";

export const useHtmlDownload = (sessionId: string | null) => {
  const [ htmlContent, setHtmlContent ] = useState("");
  const [ error, setError ] = useState<string | null>(null);
  const [ isPending, startTransition ] = useTransition();
  const { email } = useSearchParams();

  const fetchHtml = async () => {
    startTransition(async () => {
      setError(null);

      try {
        // Step 1: Get access token
        const tokenResponse = await fetch(
          `${PUBLIC_PLANX_REST_API_URL}/lps/download/token`, 
          { 
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, sessionId }) 
          }
        );
        if (!tokenResponse.ok) {
          throw new Error(`Token request failed: ${tokenResponse.status}`);
        }

        const { token } = await tokenResponse.json();

        // Step 2: Use token to fetch HTML
        const htmlResponse = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lps/download/html`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({ email, sessionId })
        });

        if (!htmlResponse.ok) {
          throw new Error(`HTML request failed: ${htmlResponse.status}`);
        }

        const html = await htmlResponse.text();
        setHtmlContent(html);

      } catch (err) {
        setError((err as Error).message);
        setHtmlContent("");
      }
    });
  };

  useEffect(() => {
    if (!email) {
      setError("Missing email parameter");
      return;
    }

    if (!sessionId) {
      setError("Missing applicationId parameter");
      return;
    }

    fetchHtml();
  }, [sessionId, email]);

  return {
    htmlContent,
    loading: isPending,
    error,
    fetchHtml,
  };
};