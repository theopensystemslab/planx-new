import { getFlattenedFlowData } from "lib/api/flow/requests";
import { queryClient } from "lib/queryClient";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import { Store } from "pages/FlowEditor/lib/store";
import OfflineLayout from "pages/layout/OfflineLayout";
import PublicLayout from "pages/layout/PublicLayout";
import SaveAndReturnLayout from "pages/layout/SaveAndReturnLayout";
import { TestWarningPage } from "pages/Preview/TestWarningPage";
import React from "react";
import type { PublicContext } from "routes/_public/-loader";
import { Flow } from "types";
import WatermarkBackground from "ui/shared/WatermarkBackground";
import { z } from "zod";

import { LoadingLayout } from "../../pages/layout/LoadingLayout";
import {
  fetchSettingsForPublishedView,
  getLastPublishedAt,
  PublishedViewSettings,
} from "./publishedQueries";
import { setPath } from "./utils";

// Types
export type PublicRouteMode =
  | "preview"
  | "published"
  | "draft"
  | "pay"
  | "download";

export interface PublicRouteData {
  flow: Flow;
  flowData: Store.Flow;
  publishedFlow?: Store.Flow;
  settings: PublishedViewSettings;
  lastPublishedDate?: string;
  teamSlug: string;
  flowSlug: string;
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

  let flowData;
  let publishedFlow;
  let lastPublishedDate;

  // Mode-specific data loading
  switch (mode) {
    case "preview":
    case "draft":
      // Load current flow data for preview/draft
      flowData = await queryClient.fetchQuery({
        queryKey: ["flattenedFlowData", mode, flow.id],
        queryFn: () =>
          getFlattenedFlowData({
            flowId: flow.id,
            isDraft: mode === "draft",
          }),
      });

      // Get last published date for preview
      if (mode === "preview") {
        lastPublishedDate = await getLastPublishedAt(flow.id);
      }
      break;

    case "published":
    case "pay":
      // Load published flow data
      publishedFlow = flow.publishedFlows[0]?.data;
      if (!publishedFlow) {
        throw new Error(`Flow ${flowSlug} not published for ${teamSlug}`);
      }
      lastPublishedDate = await getLastPublishedAt(flow.id);
      flowData = publishedFlow;
      break;

    case "download":
      // For download mode, we don't need flow data, just team/flow existence validation
      // Flow data will be empty object, store setup handled separately
      flowData = {};
      break;
  }

  return {
    flow,
    flowData,
    publishedFlow,
    settings: data,
    lastPublishedDate,
    teamSlug,
    flowSlug,
  };
};

// Store update function
export const updateStoreWithPublicRouteData = (data: PublicRouteData): void => {
  const state = useStore.getState();

  state.setFlow({
    id: data.flow.id,
    flow: data.flowData,
    flowSlug: data.flowSlug,
    flowStatus: data.flow.status,
    flowName: data.flow.name,
  });

  state.setGlobalSettings(data.settings.globalSettings[0]);
  state.setFlowSettings(data.flow.settings);
  state.setTeam(data.flow.team);

  if (data.lastPublishedDate) {
    useStore.setState({ lastPublishedDate: data.lastPublishedDate });
  }
};

// Complete beforeLoad helper
export const createPublicRouteBeforeLoad = <T extends PublicRouteMode>(
  mode: T,
  context: PublicContext,
) => {
  return async ({
    params,
    search,
  }: {
    params: Record<string, string>;
    search: PublicRouteSearchParams[T];
  }) => {
    try {
      const data = await loadPublicRouteData(mode, context);
      updateStoreWithPublicRouteData(data);

      // Set application path for save-and-return flows
      if (mode === "published" || mode === "pay") {
        setPath(data.flowData, {
          params: {
            ...params,
            ...(search?.sessionId && { sessionId: search.sessionId }),
          },
        });
      }

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

const MODE_CONFIG: Record<
  PublicRouteMode,
  {
    wrappers: Array<React.ComponentType<{ children: React.ReactNode }>>;
    watermarkVisible: boolean;
  }
> = {
  preview: {
    wrappers: [TestWarningPage, SaveAndReturnLayout],
    watermarkVisible: true,
  },
  published: {
    wrappers: [OfflineLayout, SaveAndReturnLayout],
    watermarkVisible: false,
  },
  draft: {
    wrappers: [SaveAndReturnLayout],
    watermarkVisible: true,
  },
  pay: {
    wrappers: [SaveAndReturnLayout],
    watermarkVisible: false,
  },
  download: {
    wrappers: [],
    watermarkVisible: false,
  },
};

// Layout wrapper components
export const PublicRouteLayout: React.FC<{
  mode: PublicRouteMode;
  children: React.ReactNode;
}> = ({ mode, children }) => {
  const config = MODE_CONFIG[mode];

  const wrappedContent = config.wrappers.reduceRight(
    (content, Wrapper) => <Wrapper>{content}</Wrapper>,
    children,
  );

  return (
    <LoadingLayout>
      <PublicLayout>
        <WatermarkBackground
          variant="dark"
          opacity={0.05}
          forceVisibility={config.watermarkVisible}
        />
        {wrappedContent}
      </PublicLayout>
    </LoadingLayout>
  );
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
