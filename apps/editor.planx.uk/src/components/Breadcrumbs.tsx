import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useParams } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

import { useGetFlowDetails } from "./useGetFlowDetails";

export const BREADCRUMBS_HEIGHT = 3;

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  alignItems: "center",
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: theme.zIndex.appBar,
  backgroundColor: `rgba(255, 255, 255, 0.2)`,
  padding: theme.spacing(1, 1.25, 1, 2),
  borderRadius: "0 50px 50px 0",
  backdropFilter: "blur(20px)",
}));

const BreadcrumbsRoot = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const BreadcrumbsLink = styled(CustomLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  borderBottom: `2px solid ${theme.palette.text.primary}`,
  fontWeight: "inherit",
})) as typeof CustomLink;

const Breadcrumbs: React.FC = () => {
  const params = useParams({ strict: false });
  const { team: teamSlug, flow: flowParam } = params;
  const flowSlug = flowParam?.split(",")[0]; // in folders, the node ID is appended to flow slug--so we need to separate it

  const { data } = useGetFlowDetails(teamSlug, flowSlug);
  const isStandalone = useStore(
    (state) => state.previewEnvironment === "standalone",
  );

  const canUserEditTeam = useStore((state) => state.canUserEditTeam);

  if (!teamSlug || !flowSlug || !data?.flows.length) return null;
  const { status: flowStatus, isService } = data.flows[0];

  return (
    <BreadcrumbsContainer>
      <BreadcrumbsRoot>
        {params.team && (
          <BreadcrumbsLink
            to="/app/$team"
            params={{
              team: teamSlug,
            }}
            {...(isStandalone && { target: "_blank" })}
            variant="body1"
          >
            {params.team}
          </BreadcrumbsLink>
        )}
        {params.flow && (
          <>
            {" / "}
            <BreadcrumbsLink
              to="/app/$team/$flow"
              params={{
                team: teamSlug,
                flow: flowSlug,
              }}
              {...(isStandalone && { target: "_blank" })}
              variant="body1"
              sx={{ borderBottomColor: "transparent" }}
            >
              {flowSlug}
            </BreadcrumbsLink>
          </>
        )}
      </BreadcrumbsRoot>
      {isService && flowStatus && canUserEditTeam(teamSlug) && (
        <Box sx={(theme) => ({ color: theme.palette.text.primary })}>
          <BreadcrumbsLink
            to="/app/$team/$flow/settings"
            params={{
              team: teamSlug,
              flow: flowSlug,
            }}
            title="Update service status"
            sx={{ textDecoration: "none" }}
          >
            <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
              {flowStatus}
            </FlowTag>
          </BreadcrumbsLink>
        </Box>
      )}
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
