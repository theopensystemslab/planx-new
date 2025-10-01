import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@lib/queryClient";
import type { ApplicationsResponse } from "./useFetchApplications";
import { PUBLIC_PLANX_GRAPHQL_API_URL } from "astro:env/client";
import gql from "graphql-tag";
import { print } from "graphql";
import { useStore } from "@nanostores/react";
import { $session } from "@stores/session";

const MUTATION = gql`
  mutation SoftDeleteLowcalSessionLPS($applicationId: uuid!) {
    applications: update_lowcal_sessions_by_pk(
      pk_columns: { id: $applicationId }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`;

export const useDeleteApplication = () => {
  const { email } = useStore($session);
  if (!email) throw Error("Unable to find email in search params");

  const { mutate: deleteApplication } = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await fetch(PUBLIC_PLANX_GRAPHQL_API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-hasura-lowcal-session-id": applicationId,
          "x-hasura-lowcal-email": email,
        },
        body: JSON.stringify({
          query: print(MUTATION),
          variables: { applicationId }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `GraphQL query failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
      }
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