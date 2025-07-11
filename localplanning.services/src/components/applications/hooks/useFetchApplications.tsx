import { queryClient } from "@lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_PLANX_REST_API_URL } from "astro:env/client";

export interface Application {
  id: string;
  updatedAt: string;
  submittedAt: string | null;
  service: {
    name: string;
    slug: string;
  };
  team: {
    name: string;
    slug: string;
    domain: string | null;
  };
  url: string;
}

export const useFetchApplications = () => {  
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  const { data: applications = [], isLoading, error } = useQuery<Application[]>({
    queryKey: ["fetchApplications"],
    queryFn: async () => {
      const response = await fetch(`${PUBLIC_PLANX_REST_API_URL}/lps/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email })
      });

      if (!response.ok) {
        const { error = "UNHANDLED_ERROR" } = await response.json();
        throw new Error(error);
      }

      const { applications } = await response.json();
      return applications;
    },
    // Retain cache of applications for whilst tab remains open
    // Data could only be refetch with a new magic link
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  }, queryClient);

  return {
    applications,
    isLoading,
    error,
  };
};