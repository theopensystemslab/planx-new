import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { getNotionPage } from "lib/api/notion/requests";
import { fromSlug } from "pages/FlowEditor/data/types";
import React, { lazy, Suspense } from "react";

import { COMPONENT_GUIDANCE_PAGES } from "./guidancePages";

// Only load react-notion-x (and its styles) when the tab is opened
const NotionPage = lazy(() => import("./NotionPage"));

const Message: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ color: "text.secondary" }}>
    {children}
  </Typography>
);

const Loading = () => (
  <DelayedLoadingIndicator
    msDelayBeforeVisible={0}
    text="Loading guidance..."
  />
);

const Resources: React.FC<{ type: string }> = ({ type }) => {
  const componentType = fromSlug(type);
  const pageId = componentType && COMPONENT_GUIDANCE_PAGES[componentType];

  const { data, isPending, error } = useQuery({
    queryKey: ["notionPage", pageId],
    queryFn: () => getNotionPage(pageId!),
    enabled: Boolean(pageId),
    staleTime: 5 * 60 * 1000,
  });

  if (!pageId) return <Message>Guidance coming soon.</Message>;
  if (error)
    return <Message>Unable to load guidance for this component.</Message>;
  if (isPending) return <Loading />;

  return (
    <Box>
      <Suspense fallback={<Loading />}>
        <NotionPage recordMap={data} />
      </Suspense>
    </Box>
  );
};

export default Resources;
