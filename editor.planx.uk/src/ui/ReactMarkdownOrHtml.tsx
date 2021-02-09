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
  if (props.source?.includes("<p>")) {
    return (
      <div
        className={classNames(props.className, classes.htmlRoot)}
        dangerouslySetInnerHTML={{ __html: props.source }}
      />
    );
  }
  return <ReactMarkdown source={props.source} className={props.className} />;
}
