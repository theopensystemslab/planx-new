import ReactJson from "@microlink/react-json-view";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { useStore } from "../../lib/store";

const Console = styled(Box)(({ theme }) => ({
  overflow: "auto",
  padding: theme.spacing(2),
  height: "100%",
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
}));

export const DebugConsole = () => {
  const [passport, flags, breadcrumbs, flowId, cachedBreadcrumbs, teamId] =
    useStore((state) => [
      state.computePassport(),
      state.collectedFlags(),
      state.breadcrumbs,
      state.id,
      state.cachedBreadcrumbs,
      state.teamId,
    ]);
  return (
    <Console>
      <div style={{ fontSize: "medium" }}>
        <ReactJson
          src={{
            teamId,
            flowId,
            passport,
            flags,
            breadcrumbs,
            cachedBreadcrumbs,
          }}
          theme="monokai"
          collapsed={2}
          displayDataTypes={false}
          indentWidth={2}
          style={{ padding: "2em 0", background: "transparent" }}
        />
        <Typography variant="body2">
          <a
            href={`${
              import.meta.env.VITE_APP_API_URL
            }/flows/${flowId}/download-schema`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            Download the flow schema
          </a>
        </Typography>
      </div>
    </Console>
  );
};
