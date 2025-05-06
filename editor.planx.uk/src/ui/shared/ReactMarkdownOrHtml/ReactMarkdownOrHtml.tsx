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
});

const HTMLRoot = styled(Box)(({ theme }) => styles(theme));
const MarkdownRoot = styled(ReactMarkdown)(({ theme }) => styles(theme));

export default function ReactMarkdownOrHtml(props: {
  source?: string;
  textColor?: string;
  openLinksOnNewTab?: boolean;
  id?: string;
}): FCReturn {
  if (typeof props.source !== "string") {
    return null;
  }

  if (props.source.includes("</") || props.source.includes("<img")) {
    const replaceTarget = props.openLinksOnNewTab
      ? props.source.replaceAll(`target="_self"`, `target="_blank" external`)
      : props.source;

    return (
      <HTMLRoot
        color={props.textColor}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(replaceTarget, {
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
