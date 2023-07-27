import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import React from "react";
import ReactMarkdown from "react-markdown";
import { FONT_WEIGHT_SEMI_BOLD, linkStyle } from "theme";

const styles = (theme: Theme) => ({
  "& a": linkStyle(theme.palette.primary.main),
  "& h1": theme.typography.h2,
  "& h2": theme.typography.h3,
  "& h3": theme.typography.h3,
  "& strong": {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
  "& p:last-of-type": {
    marginBottom: 0,
  },
  "& img": {
    maxWidth: "100%",
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
  if (props.source.includes("</" || "<img")) {
    const replaceTarget = props.openLinksOnNewTab
      ? props.source.replaceAll(`target="_self"`, `target="_blank" external`)
      : props.source;
    const incrementHeaders = props.manuallyIncrementHeaders
      ? replaceTarget
      : incrementHeaderElements(replaceTarget);

    return (
      <HTMLRoot
        color={props.textColor}
        dangerouslySetInnerHTML={{ __html: incrementHeaders }}
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
