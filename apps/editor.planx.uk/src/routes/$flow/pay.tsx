import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import React from "react";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import { fetchSettingsForPublishedView } from "utils/routeUtils/publishedQueries";
import { getTeamFromDomain } from "utils/routeUtils/utils";

export const Route = createFileRoute("/$flow/pay")({
  beforeLoad: async ({ params }) => {
    const { flow: flowParam } = params;
    const flowSlug = flowParam.split(",")[0];

    // For custom domains, get team from domain
    const teamSlug = await getTeamFromDomain(window.location.hostname);

    if (!teamSlug) {
      throw new Error("Team not found for this domain");
    }

    try {
      // Fetch settings for custom domain pay view
      const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
      const flow = data.flows[0];

      if (!flow) {
        throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
      }

      const publishedFlow = flow.publishedFlows[0]?.data;
      if (!publishedFlow) {
        throw new Error(`Flow ${flowSlug} not published for ${teamSlug}`);
      }

      // Set up store with published flow data for pay functionality
      const state = useStore.getState();
      state.setFlow({
        id: flow.id,
        flow: publishedFlow,
        flowSlug,
        flowStatus: flow.status,
        flowName: flow.name,
      });
      state.setGlobalSettings(data.globalSettings[0]);
      state.setFlowSettings(flow.settings);
      state.setTeam(flow.team);

      return {
        flow,
        publishedFlow,
        settings: data,
        teamSlug,
        isCustomDomain: true,
      };
    } catch (error) {
      console.error("Failed to load custom domain pay data:", error);
      throw error;
    }
  },

  errorComponent: ({ error }) => {
    if (error?.message?.includes("Team not found")) {
      return (
        <ErrorPage title="Domain not configured">
          This domain is not configured for any team. Please contact support.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("not found")) {
      return (
        <ErrorPage title="Payment link not found">
          Sorry, we can't find that payment link on this domain.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("not published")) {
      return (
        <ErrorPage title="Payment not available">
          This payment link is not available. The service may not be published
          yet.
        </ErrorPage>
      );
    }

    return (
      <ErrorPage title="Payment error">
        There was an error loading the payment page. Please try again later.
      </ErrorPage>
    );
  },

  component: CustomDomainPayComponent,
});

function CustomDomainPayComponent() {
  return (
    <PublicLayout>
      <WatermarkBackground
        variant="dark"
        opacity={0.05}
        forceVisibility={false}
      />
      <OfflineLayout>
        <SaveAndReturnLayout>
          <div>
            <h1>Payment Page</h1>
            <p>Custom domain payment functionality will be implemented here.</p>
            <p>
              This route handles payment processing for custom domain flows.
            </p>
          </div>
        </SaveAndReturnLayout>
      </OfflineLayout>
    </PublicLayout>
  );
}
