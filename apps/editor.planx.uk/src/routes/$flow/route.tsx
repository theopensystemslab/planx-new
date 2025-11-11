// import { createFileRoute, Outlet } from "@tanstack/react-router";
// import ErrorPage from "pages/ErrorPage/ErrorPage";
// import { useStore } from "pages/FlowEditor/lib/store";
// import OfflineLayout from "pages/layout/OfflineLayout";
// import PublicLayout from "pages/layout/PublicLayout";
// import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
// import React from "react";
// import { getTeamFromDomain } from "routes-navi/utils";
// import WatermarkBackground from "ui/shared/WatermarkBackground";
// import {
//   fetchSettingsForPublishedView,
//   getLastPublishedAt,
// } from "utils/routeUtils/publishedQueries";

// export const Route = createFileRoute("/$flow")({
//   beforeLoad: async ({ params }) => {
//     const { flow: flowParam } = params;
//     const flowSlug = flowParam.split(",")[0];

//     // For custom domains, get team from domain
//     const teamSlug = await getTeamFromDomain(window.location.hostname);

//     if (!teamSlug) {
//       throw new Error("Team not found for this domain");
//     }

//     try {
//       // Fetch settings for custom domain published view
//       const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
//       const flow = data.flows[0];

//       if (!flow) {
//         throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
//       }

//       const publishedFlow = flow.publishedFlows[0]?.data;
//       if (!publishedFlow) {
//         throw new Error(`Flow ${flowSlug} not published for ${teamSlug}`);
//       }

//       // Get last published date
//       const lastPublishedDate = await getLastPublishedAt(flow.id);

//       // Set up store with published flow data
//       const state = useStore.getState();
//       state.setFlow({
//         id: flow.id,
//         flow: publishedFlow,
//         flowSlug,
//         flowStatus: flow.status,
//         flowName: flow.name,
//       });
//       state.setGlobalSettings(data.globalSettings[0]);
//       state.setFlowSettings(flow.settings);
//       state.setTeam(flow.team);
//       useStore.setState({ lastPublishedDate });

//       return {
//         flow,
//         publishedFlow,
//         settings: data,
//         lastPublishedDate,
//         teamSlug,
//         isCustomDomain: true,
//       };
//     } catch (error) {
//       console.error("Failed to load custom domain flow data:", error);
//       throw error;
//     }
//   },

//   errorComponent: ({ error }) => {
//     if (error?.message?.includes("Team not found")) {
//       return (
//         <ErrorPage title="Domain not configured">
//           This domain is not configured for any team. Please contact support.
//         </ErrorPage>
//       );
//     }

//     if (error?.message?.includes("not found")) {
//       return (
//         <ErrorPage title="Service not found">
//           The service you're looking for doesn't exist on this domain.
//         </ErrorPage>
//       );
//     }

//     if (error?.message?.includes("not published")) {
//       return (
//         <ErrorPage title="Service not available">
//           This service is not currently available. Please try again later.
//         </ErrorPage>
//       );
//     }

//     return (
//       <ErrorPage title="Service error">
//         There was an error loading the service. Please try again later.
//       </ErrorPage>
//     );
//   },

//   component: CustomDomainFlowLayoutComponent,
// });

// function CustomDomainFlowLayoutComponent() {
//   return (
//     <PublicLayout>
//       <WatermarkBackground
//         variant="dark"
//         opacity={0.05}
//         forceVisibility={false}
//       />
//       <OfflineLayout>
//         <SaveAndReturnLayout>
//           <Outlet />
//         </SaveAndReturnLayout>
//       </OfflineLayout>
//     </PublicLayout>
//   );
// }
