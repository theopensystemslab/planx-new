import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import useSWR from "swr";

const useStyles = makeStyles(() => ({
  link: {
    position: "fixed",
    top: 0,
    zIndex: 10000, // there's a silly z-index in material somewhere
    background: "rgba(255,255,255,0.5)",
    color: "black",
    left: "50%",
    transform: "translate(-50%, 0)",
    padding: 10,
    display: "block",
  },
}));

interface GithubJSON {
  branch: string;
  pullRequestUrl?: string;
}

function HelperLink({ branch, pullRequestUrl }: GithubJSON) {
  const { link } = useStyles();

  if (pullRequestUrl) {
    return (
      <a className={link} href={pullRequestUrl}>
        {branch}
      </a>
    );
  } else {
    return (
      <div className={link} style={{ pointerEvents: "none" }}>
        {branch}
      </div>
    );
  }
}

export default function GitHelper(): FCReturn {
  const { data } = useSWR<GithubJSON>("/github.json", {
    shouldRetryOnError: false,
  });

  if (data && data.branch !== "production") {
    return <HelperLink {...data} />;
  } else {
    return null;
  }
}
