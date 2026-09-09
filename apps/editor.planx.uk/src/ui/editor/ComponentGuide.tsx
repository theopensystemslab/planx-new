import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { getComponentGuide } from "lib/api/notion/requests";
import type { ComponentGuideResponse } from "lib/api/notion/types";
import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

/**
 * Notion embed blocks (e.g. a Storybook story) come through as plain markdown
 * links. Links to these trusted hosts are upgraded to an inline <iframe>;
 * everything else stays a normal link.
 */
const EMBEDDABLE_HOSTS = ["storybook.planx.uk"];

const hostOf = (url?: string): string | undefined => {
  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
};

const guideComponents: Components = {
  a: ({ href, children }) => {
    const host = hostOf(href);
    if (href && host && EMBEDDABLE_HOSTS.includes(host)) {
      const title =
        typeof children === "string" && children && children !== href
          ? children
          : "Embedded example";
      return (
        <Box component="span" sx={{ display: "block", my: 2 }}>
          <Box
            component="iframe"
            src={href}
            title={title}
            loading="lazy"
            sx={{
              width: "100%",
              height: 400,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          />
        </Box>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

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
      <Box sx={{ px: 4, py: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          We couldn't load the guidance for this component right now. Please try
          again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 2 }}>
      <ReactMarkdownOrHtml
        source={data.markdown}
        openLinksOnNewTab
        components={guideComponents}
      />
    </Box>
  );
};

export default ComponentGuide;
