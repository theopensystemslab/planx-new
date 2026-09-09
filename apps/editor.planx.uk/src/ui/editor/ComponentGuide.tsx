import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { getComponentGuide } from "lib/api/notion/requests";
import type { ComponentGuideResponse } from "lib/api/notion/types";
import React, { useEffect, useState } from "react";
import type { Components } from "react-markdown";
import Permission from "ui/editor/Permission";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

/**
 * Per-browser override for which Notion page the "How to use this component"
 * tab reads from. Set by platform admins via the input at the top of the tab.
 *
 * Three states:
 * - absent key  → no override, use the API's default page
 * - `NO_CONTENT` → explicitly show nothing
 * - a page id   → read that Notion page
 */
const STORAGE_KEY = "componentGuide:notionPageId";
const NO_CONTENT = "";

const readStoredPageId = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStoredPageId = (value: string | null): void => {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage unavailable (private mode, blocked) — override just won't persist
  }
};

/** Accepts a bare id, a dashed UUID, or a full Notion URL */
const extractNotionId = (input: string): string | null => {
  const match = input.replace(/-/g, "").match(/[0-9a-f]{32}/i);
  return match ? match[0].toLowerCase() : null;
};

/**
 * Notion embed blocks (Storybook stories, YouTube videos) arrive as plain
 * markdown links. Links to these trusted hosts are upgraded to an inline
 * <iframe>; everything else stays a normal link.
 */
const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
];

const hostOf = (url?: string): string | undefined => {
  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
};

const youTubeId = (url: string, host: string): string => {
  const { pathname, searchParams } = new URL(url);
  if (host === "youtu.be") return pathname.slice(1);
  if (pathname.startsWith("/embed/") || pathname.startsWith("/shorts/")) {
    return pathname.split("/")[2] ?? "";
  }
  return searchParams.get("v") ?? "";
};

/** A directly-embeddable iframe src for a trusted URL, or null if not embeddable */
const toEmbedSrc = (url: string, host: string): string | null => {
  if (host === "storybook.planx.uk") return url;
  if (!YOUTUBE_HOSTS.includes(host)) return null;
  const id = youTubeId(url, host);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
};

const guideComponents: Components = {
  a: ({ href, children }) => {
    const host = hostOf(href);
    const embedSrc = href && host ? toEmbedSrc(href, host) : null;

    if (embedSrc && host) {
      const title =
        typeof children === "string" && children && children !== href
          ? children
          : "Embedded example";
      const isVideo = host !== "storybook.planx.uk";
      return (
        <Box component="span" sx={{ display: "block", my: 2 }}>
          <Box
            component="iframe"
            src={embedSrc}
            title={title}
            loading="lazy"
            allow="fullscreen"
            sx={{
              width: "100%",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              ...(isVideo ? { aspectRatio: "16 / 9" } : { height: 400 }),
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

interface ConfigProps {
  /** The page id currently in effect (override, else the API default), or "" for no content */
  activePageId?: string;
  /** Called with a page id, or "" to show no content */
  onSave: (value: string) => void;
}

const ComponentGuideConfig: React.FC<ConfigProps> = ({
  activePageId,
  onSave,
}) => {
  const [value, setValue] = useState(activePageId ?? "");
  const [error, setError] = useState<string>();

  // Sync the field once the API response tells us the effective page id
  useEffect(() => {
    setValue(activePageId ?? "");
  }, [activePageId]);

  const isDirty = value.trim() !== (activePageId ?? "");

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      // Blank is valid — it means "show no guidance for this component"
      setError(undefined);
      onSave(NO_CONTENT);
      return;
    }
    const id = extractNotionId(trimmed);
    if (!id) {
      setError("Enter a Notion page ID or URL, or leave blank for no content");
      return;
    }
    setError(undefined);
    onSave(id);
  };

  return (
    <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: "bold" }}>
        Notion page ID
      </Typography>
      <ErrorWrapper error={error}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <Input
            fullWidth
            bordered
            value={value}
            placeholder="Notion page ID or URL — blank for no content"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save
          </Button>
        </Box>
      </ErrorWrapper>
    </Box>
  );
};

/**
 * Renders the "How to use this component" guide in the node editor modal.
 * Content is authored in Notion and served as markdown by api.planx.uk.
 */
const ComponentGuide: React.FC = () => {
  const [overridePageId, setOverridePageId] = useState<string | null>(() =>
    readStoredPageId(),
  );

  const showNoContent = overridePageId === NO_CONTENT;

  const { data, isPending, isError } = useQuery<
    ComponentGuideResponse,
    APIError<unknown>
  >({
    queryKey: ["componentGuide", overridePageId],
    queryFn: () => getComponentGuide(overridePageId || undefined),
    enabled: !showNoContent,
    // Content changes rarely and the API caches it too; avoid refetch churn
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // `value` is a page id, or NO_CONTENT ("") to explicitly show nothing
  const handleSave = (value: string) => {
    writeStoredPageId(value);
    setOverridePageId(value);
  };

  const renderBody = () => {
    if (showNoContent) {
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No guidance is set for this component.
        </Typography>
      );
    }
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
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          We couldn't load the guidance for this component right now. Please try
          again later.
        </Typography>
      );
    }
    return (
      <ReactMarkdownOrHtml
        source={data.markdown}
        openLinksOnNewTab
        components={guideComponents}
      />
    );
  };

  return (
    <Box sx={{ px: 4, py: 2 }}>
      <Permission.IsPlatformAdmin>
        <ComponentGuideConfig
          activePageId={overridePageId ?? data?.pageId}
          onSave={handleSave}
        />
      </Permission.IsPlatformAdmin>
      {renderBody()}
    </Box>
  );
};

export default ComponentGuide;
