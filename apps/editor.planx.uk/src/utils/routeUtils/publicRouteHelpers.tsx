import { client } from "lib/graphql";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { type Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { PublicContext } from "routes/_public/-loader";
import { z } from "zod";

import {
  fetchSettingsForPublishedView,
  GET_PUBLISHED_FLOW_DATA,
  type PublishedFlow,
  PublishedViewSettings,
} from "./publishedQueries";
import { computePath } from "./utils";

export type PublicRouteMode = "preview" | "published" | "draft" | "download";

export interface PublicRouteData {
  flow: PublishedFlow;
  settings: PublishedViewSettings;
  lastPublishedDate?: string;
  teamSlug: string;
  flowSlug: string;
  hasSendComponent: boolean;
}

const basePublicSearchSchema = z.object({
  sessionId: z.string().optional(),
  email: z.string().optional(),
});

// In practice, `/preview` and `/draft` routes are public but only accessed by editors or testers
//   they do not support Save & Return nor integrations like Pay (therefore no sessionId nor email param)
const nonSaveAndReturnSearchSchema = z.object({
  sessionId: z.undefined(),
  email: z.undefined(),
});

// Search schemas
export const publicRouteSearchSchemas = {
  published: basePublicSearchSchema.extend({
    analytics: z.boolean().optional(),
  }),
  preview: nonSaveAndReturnSearchSchema,
  draft: nonSaveAndReturnSearchSchema,
  pay: basePublicSearchSchema,
  download: basePublicSearchSchema,
};

// Inferred types from zod schemas
type PublicRouteSearchParams = {
  [K in keyof typeof publicRouteSearchSchemas]: z.infer<
    (typeof publicRouteSearchSchemas)[K]
  >;
};

// Common data loading function
export const loadPublicRouteData = async (
  mode: PublicRouteMode,
  { flow: flowSlug, team: teamSlug }: PublicContext,
): Promise<PublicRouteData> => {
  // Fetch settings (common for all modes)
  const data = await fetchSettingsForPublishedView(flowSlug, teamSlug);
  const flow = data.flows[0];

  if (!flow) {
    throw new Error(`Flow ${flowSlug} not found for ${teamSlug}`);
  }

  return {
    flow,
    hasSendComponent: flow.publishedFlows[0].hasSendComponent,
    settings: data,
    lastPublishedDate: flow.publishedFlows[0].createdAt,
    teamSlug,
    flowSlug,
  };
};

export const updateStoreWithPublicRouteData = (
  mode: PublicRouteMode,
  data: PublicRouteData,
  search?: { sessionId?: string },
): void => {
  useStore.setState({
    id: data.flow.id,
    flowSlug: data.flowSlug,
    flowStatus: data.flow.status,
    flowName: data.flow.name,
    lastPublishedDate: data?.lastPublishedDate,
  });

  const state = useStore.getState();
  state.setGlobalSettings(data.settings.globalSettings[0]);
  state.setFlowSettings(data.flow.settings);
  state.setTeam(data.flow.team);

  // Only /published routes use the SaveAndReturn layout, but this needs to be resolved on beforeLoad()
  if (mode === "published") {
    const hasSendComponent = data.flow.publishedFlows[0]?.hasSendComponent;
    const isEmailCaptured = Boolean(state.saveToEmail);
    useStore.setState({
      path: computePath(hasSendComponent, search?.sessionId, isEmailCaptured),
    });
  }
};

export const createPublicRouteBeforeLoad = <T extends PublicRouteMode>(
  mode: T,
  context: PublicContext,
) => {
  return async ({ search }: { search: PublicRouteSearchParams[T] }) => {
    try {
      const data = await loadPublicRouteData(mode, context);
      updateStoreWithPublicRouteData(mode, data, search);

      return data;
    } catch (error) {
      console.error(`Failed to load ${mode} data:`, error);
      throw error;
    }
  };
};

// Error component helpers
export const createPublicRouteErrorComponent = (mode: PublicRouteMode) => {
  const modeDisplayNames = {
    preview: "Preview",
    published: "Published flow",
    draft: "Draft flow",
    pay: "Payment page",
    download: "Download page",
  };

  const modeDisplayName: string = modeDisplayNames[mode];

  return ({ error }: { error: Error }) => {
    if (error?.message?.includes("not found")) {
      return (
        <ErrorPage title={`${modeDisplayName} not found`}>
          The {modeDisplayName} you're looking for doesn't exist or you don't
          have permission to access it.
        </ErrorPage>
      );
    }

    if (error?.message?.includes("not published")) {
      return (
        <ErrorPage title={`${modeDisplayName} not available`}>
          This {modeDisplayName} is not available. The service may not be
          published yet.
        </ErrorPage>
      );
    }

    return (
      <ErrorPage title={`${modeDisplayName} error`}>
        There was an error loading the {modeDisplayName}. Please try again
        later.
      </ErrorPage>
    );
  };
};

// Meta tags helper
export const createPublicRouteHead = (mode: PublicRouteMode) => {
  const shouldNoIndex = mode === "preview" || mode === "draft";

  if (shouldNoIndex) {
    return () => ({
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow",
        },
        {
          name: "googlebot",
          content: "noindex, nofollow",
        },
      ],
    });
  }

  return undefined;
};

export const updateStoreWithFlowData = (flowData: Store.Flow): void => {
  useStore.setState({ flow: flowData, isFlowLoaded: false });
  // Initialise navigation store now that we have flow data to derive sections from
  // TODO: Pre-compute this on publish?
  useStore.getState().initNavigationStore();
  useStore.setState({ isFlowLoaded: true });
};

/**
 * Prefetch flow data. Do not await - just kick off request.
 * Once loaded, set the required store values
 */
export const prefetchPublishedFlowData = ({
  context,
}: {
  context: PublicRouteData;
}) => {
  client
    .query({
      query: GET_PUBLISHED_FLOW_DATA,
      variables: { flowId: context.flow.id },
      context: { role: "public" },
    })
    .then(({ data }) => {
      updateStoreWithFlowData(data.publishedFlows[0].data);
    });
};
