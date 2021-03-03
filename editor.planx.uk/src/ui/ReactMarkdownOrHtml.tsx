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
}): FCReturn {
  const classes = useClasses();
  if (typeof props.source !== "string") {
    return null;
  }
  if (props.source.includes("<p>") || props.source.includes("<a")) {
    const replaceTarget = props.source.replace(
      `target="_self"`,
      `target="_blank"`
    );
    return (
      <div
        className={classNames(props.className, classes.htmlRoot)}
        dangerouslySetInnerHTML={{ __html: replaceTarget }}
      />
    );
  }
  return <ReactMarkdown source={props.source} className={props.className} />;
}
