import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { getComponentGuide } from "lib/api/notion/requests";
import type { ComponentGuideResponse } from "lib/api/notion/types";
import React from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

/**
 * Renders the "How to use this component" guide in the node editor modal.
 * Content is authored in Notion and served as markdown by api.planx.uk.
 */
const ComponentGuide: React.FC = () => {
  const { data, isPending, isError } = useQuery<
    ComponentGuideResponse,
    APIError<unknown>
  >({
    queryKey: ["componentGuide"],
    queryFn: getComponentGuide,
    // Content changes rarely and the API caches it too; avoid refetch churn
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isPending) {
    return (
      <DelayedLoadingIndicator
        msDelayBeforeVisible={100}
        text="Loading guidance…"
      />
    );
  }

  if (isError || !data?.markdown) {
    return (
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          We couldn't load the guidance for this component right now. Please try
          again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5 }}>
      <ReactMarkdownOrHtml source={data.markdown} openLinksOnNewTab />
    </Box>
  );
};

export default ComponentGuide;
