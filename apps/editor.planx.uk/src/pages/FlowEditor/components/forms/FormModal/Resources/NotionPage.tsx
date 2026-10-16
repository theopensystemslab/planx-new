import "react-notion-x/styles.css";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import type { ExtendedRecordMap } from "notion-types";
import React from "react";
import { NotionRenderer } from "react-notion-x";
import { richTextStyles } from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { NOTION_SITE_URL } from "./guidancePages";

const EMBED_EXTRA_HEIGHT_PX = 80;

const Root = styled("div")(({ theme }) => ({
  ...richTextStyles(theme),
  // Inherit editor typography and fit the modal, rather than Notion's full-page layout
  "--notion-font": theme.typography.fontFamily,
  "& .notion": {
    fontSize: "inherit",
    lineHeight: "inherit",
    color: theme.palette.text.primary,
  },
  "& .notion-app, & .notion": {
    minHeight: "auto",
    background: "transparent",
  },
  "& .notion-page": {
    width: "100%",
    padding: 0,
    "& > :first-child": {
      marginTop: 0,
    },
    // Match the width of form content, for a readable line length
    // Embeds are excluded, as they are already sized to their content (see below)
    "& > :not(.notion-asset-wrapper-embed)": {
      width: "100%",
      minWidth: 0,
      maxWidth: theme.breakpoints.values.formWrap,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  // Notion renders blocks with its own markup - map these to our rich text equivalents
  // Text blocks are <div> elements, style as paragraphs
  "& .notion-text": {
    padding: 0,
    margin: "0.5em 0",
  },
  // Headings are rendered as h2-h4, so match the incremented headings of ReactMarkdownOrHtml
  "& .notion-h": {
    display: "block",
    padding: 0,
    lineHeight: "inherit",
    margin: "revert",
  },
  "& .notion-h1": theme.typography.h2,
  "& .notion-h2": theme.typography.h3,
  "& .notion-h3": theme.typography.h4,
  "& .notion-list": {
    margin: "0.5em 0",
    "& li": {
      padding: 0,
    },
  },
  // Notion renders each top-level list item within its own list
  // Remove margins between adjacent lists so they appear as a single list
  "& .notion-list:has(+ .notion-list)": {
    marginBottom: 0,
  },
  "& .notion-list + .notion-list": {
    marginTop: 0,
    "& li": {
      marginTop: 0,
    },
  },
  "& .notion-link": {
    opacity: 1,
    borderBottom: "none",
    transition: "none",
    "& .notion-page-title-text": {
      textDecoration: "underline",
    },
    "& .notion-page-icon-inline": {
      width: "20px",
      height: "16px",
      marginRight: "0.25em",
      verticalAlign: "text-bottom",
    },
  },
  // Embedded content (e.g. videos, Miro, Figma) - match the team settings DesignPreview
  "& .notion-asset-wrapper iframe, & .notion-asset-wrapper .notion-yt-lite": {
    // Outline (not border) so the embed's viewport isn't reduced, avoiding unnecessary scrolling
    outline: `2px solid ${theme.palette.border.input}`,
    borderRadius: 0,
    // Spread accounts for the outline, so the visible shadow matches DesignPreview
    boxShadow: "4px 4px 0px 2px rgba(150, 150, 150, 0.5)",
    backgroundColor: theme.palette.background.paper,
  },
  "& .notion-asset-wrapper": {
    margin: "1em 0",
  },
  // Match the width of embedded content (formWrap + padding), so the embed doesn't stretch further than its contents
  "& .notion-asset-wrapper-embed": {
    width: "100%",
    minWidth: 0,
    maxWidth: theme.breakpoints.values.formWrap + 46 * 2,
    marginLeft: "auto",
    marginRight: "auto",
  },
  // Embed heights are set manually in Notion, at a wider page width than this modal
  // Content wraps and grows taller here, so extend the height to avoid scrolling
  // Inline height is set by react-notion-x, so increase via padding (iframe is absolutely positioned within)
  "& .notion-asset-wrapper-embed > div:has(> iframe)": {
    boxSizing: "content-box",
    paddingBottom: `${EMBED_EXTRA_HEIGHT_PX}px`,
  },
  "& .notion-page > :last-child": {
    marginBottom: 0,
  },
}));

const NewTabIcon = styled(NorthEastIcon)(() => ({
  fontSize: "0.8em",
  marginLeft: "0.15em",
  verticalAlign: "middle",
  flexShrink: 0,
}));

/**
 * Open all links in a new tab, so that the user doesn't navigate away from the editor
 * In-page anchors (e.g. table of contents) are left as-is
 */
const NewTabLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  children,
  ...props
}) => {
  if (!href || href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <NewTabIcon aria-hidden="true" />
      <span style={visuallyHidden}> (opens in a new tab)</span>
    </a>
  );
};

// Links to other Notion pages are given as page IDs - point these to the public Notion site
const mapPageUrl = (pageId: string) =>
  `${NOTION_SITE_URL}/${pageId.replaceAll("-", "")}`;

const NotionPage: React.FC<{ recordMap: ExtendedRecordMap }> = ({
  recordMap,
}) => (
  <Root>
    <NotionRenderer
      recordMap={recordMap}
      fullPage={false}
      darkMode={false}
      disableHeader
      mapPageUrl={mapPageUrl}
      components={{ Link: NewTabLink, PageLink: NewTabLink }}
    />
  </Root>
);

export default NotionPage;
