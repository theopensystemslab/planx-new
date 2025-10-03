import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";
import { useState, useEffect, useTransition } from "react";
import { useStore } from "@nanostores/react";
import { $session } from "@stores/session";
import { $applicationId } from "@stores/applicationId";

export const useHtmlDownload = () => {
  const [ htmlContent, setHtmlContent ] = useState("");
  const [ error, setError ] = useState<string | null>(null);
  const [ isPending, startTransition ] = useTransition();
  const { email } = useStore($session);
  const applicationId = useStore($applicationId);

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
            body: JSON.stringify({ email, sessionId: applicationId }) 
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
          body: JSON.stringify({ email, sessionId: applicationId })
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
      setError("Missing email value from store");
      return;
    }

    if (!applicationId) {
      setError("Missing applicationId value from store");
      return;
    }

    fetchHtml();
  }, [applicationId, email]);

  return {
    htmlContent,
    loading: isPending,
    error,
    fetchHtml,
  };
};