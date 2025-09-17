import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@lib/queryClient";
import type { ApplicationsResponse } from "./useFetchApplications";
import { PUBLIC_PLANX_HASURA_REST_API_URL } from "astro:env/client";
import { useSearchParams } from "./useSearchParams";

export const useDeleteApplication = () => {
  const { email } = useSearchParams();
  if (!email) throw Error("Unable to find email in search params");

  const { mutate: deleteApplication } = useMutation({
    mutationFn: (applicationId: string) => {
      const endpoint = `${PUBLIC_PLANX_HASURA_REST_API_URL}/lps/application/${applicationId}`;
      return fetch(endpoint, { 
        method: "DELETE", 
        headers: {
          "x-hasura-lowcal-session-id": applicationId,
          "x-hasura-lowcal-email": email,
        }
      });
    },
    // Manually update the cache to remove the deleted application
    onSuccess: (_data, deletedApplicationId) => {
      queryClient.setQueryData<ApplicationsResponse>(["fetchApplications"], (oldApplications) => 
        oldApplications?.filter(
          (application) => application.id !== deletedApplicationId
        )
      );
    },
  }, queryClient);

  return deleteApplication
}