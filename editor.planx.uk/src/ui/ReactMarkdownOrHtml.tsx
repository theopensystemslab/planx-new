import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";
import ReactMarkdown from "react-markdown";

const useClasses = makeStyles({
  htmlRoot: {
    "& a": {
      color: "inherit",
    },
  },
});

export default function ReactMarkdownOrHtml(props: {
  source?: string;
  className?: string;
  openLinksOnNewTab?: boolean;
  id?: string;
}): FCReturn {
  const classes = useClasses();
  if (typeof props.source !== "string") {
    return null;
  }
  if (props.source.includes("</")) {
    const replaceTarget = props.openLinksOnNewTab
      ? props.source.replaceAll(`target="_self"`, `target="_blank" external`)
      : props.source;

    return (
      <div
        className={classNames(props.className, classes.htmlRoot)}
        dangerouslySetInnerHTML={{ __html: replaceTarget }}
        id={props.id}
      />
    );
  }
  return (
    <ReactMarkdown className={props.className}>{props.source}</ReactMarkdown>
  );
}
