import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";
import { linkStyle } from "theme";

const useClasses = makeStyles((theme) => ({
  htmlRoot: {
    "& a": linkStyle(theme.palette.primary.main),
    "& h2": theme.typography.h3,
    "& h3": theme.typography.h5,
  },
}));

// Increment H1 and H2 elements to meet a11y requirements in user submitted rich text
export const incrementHeaderElements = (source: string): string => {
  const regex: RegExp = /(<\/?h)[1-2]/gi;
  const incrementer = (match: string, p1: string): string => {
    const currentLevel: number = Number(match.slice(-1));
    const newLevel: number = currentLevel + 1;
    return p1 + newLevel;
  };
  return source.replace(regex, incrementer);
};

// Replace &lt; and &gt; with < and > to render correct HTML tags when text is escaped in Rich Text Editor
export const replaceEscapedTags = (source: string): string => {
  return source.replaceAll(/&lt;(?=\/?[a-z]+\/?)([/a-z1-9 ]+?)&gt;/g, "<$1>");
};

export default function ReactMarkdownOrHtml(props: {
  source?: string;
  className?: string;
  openLinksOnNewTab?: boolean;
  id?: string;
  manuallyIncrementHeaders?: boolean;
}): FCReturn {
  const classes = useClasses();
  if (typeof props.source !== "string") {
    return null;
  }

  const isHTMLContent = ["</", "/>"].some((tag) => props.source?.includes(tag));

  if (isHTMLContent) {
    const replaceTarget = replaceEscapedTags(
      props.openLinksOnNewTab
        ? props.source.replaceAll(`target="_self"`, `target="_blank" external`)
        : props.source
    );

    const incrementHeaders = props.manuallyIncrementHeaders
      ? replaceTarget
      : incrementHeaderElements(replaceTarget);

    return (
      <div
        className={classNames(props.className, classes.htmlRoot)}
        dangerouslySetInnerHTML={{ __html: incrementHeaders }}
        id={props.id}
      />
    );
  }
  return (
    <div id={props.id}>
      <ReactMarkdown className={classNames(props.className, classes.htmlRoot)}>
        {props.source}
      </ReactMarkdown>
    </div>
  );
}
