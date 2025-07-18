import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import DOMPurify from "dompurify";
import React from "react";
import ReactMarkdown from "react-markdown";
import { FONT_WEIGHT_SEMI_BOLD, linkStyle } from "theme";

const styles = (theme: Theme) => ({
  "& a": linkStyle(theme.palette.link.main),
  "& h1": theme.typography.h2,
  "& h2": theme.typography.h3,
  "& h3": theme.typography.h4,
  "& strong": {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
  "& p:last-child, & ul:last-child, & ol:last-child": {
    marginBottom: 0,
  },
  "& img": {
    maxWidth: "100%",
  },
  "& ol li, & ul li": {
    marginTop: "0.5em",
  },
  "& ol p, & ul p": {
    margin: 0,
  },
  "& h1, & h2, & h3": {
    "& strong": {
      fontWeight: "inherit",
    },
  },
  "&": {
    wordBreak: "break-word",
  },
});

const HTMLRoot = styled(Box)(({ theme }) => styles(theme));

const MarkdownRoot = styled(ReactMarkdown)(({ theme }) => styles(theme));

// Increment H1 and H2 elements to meet a11y requirements in user submitted rich text
export const incrementHeaderElements = (source: string): string => {
  const regex = /(<\/?h)[1-2]/gi;
  const incrementer = (match: string, p1: string): string => {
    const currentLevel = Number(match.slice(-1));
    const newLevel: number = currentLevel + 1;
    return p1 + newLevel;
  };
  return source.replace(regex, incrementer);
};

export default function ReactMarkdownOrHtml(props: {
  source?: string;
  textColor?: string;
  openLinksOnNewTab?: boolean;
  id?: string;
  manuallyIncrementHeaders?: boolean;
}): FCReturn {
  if (typeof props.source !== "string") {
    return null;
  }
  if (props.source.includes("</") || props.source.includes("<img")) {
    const replaceTarget = props.openLinksOnNewTab
      ? props.source.replaceAll(`target="_self"`, `target="_blank" external`)
      : props.source;
    const incrementHeaders = props.manuallyIncrementHeaders
      ? replaceTarget
      : incrementHeaderElements(replaceTarget);

    return (
      <HTMLRoot
        color={props.textColor}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(incrementHeaders, {
            ADD_ATTR: ["target"],
          }),
        }}
        id={props.id}
      />
    );
  }
  return (
    <div id={props.id} color={props.textColor}>
      <MarkdownRoot>{props.source}</MarkdownRoot>
    </div>
  );
}
