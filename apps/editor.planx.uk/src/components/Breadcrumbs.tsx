import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useParams } from "@tanstack/react-router";
import { MENU_WIDTH_COMPACT } from "components/EditorNavMenu/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

export const BREADCRUMBS_HEIGHT = 3;

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: MENU_WIDTH_COMPACT,
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
  const team = useStore((state) => state.getTeam());
  const isStandalone = useStore(
    (state) => state.previewEnvironment === "standalone",
  );
  const flowSlug = useStore((state) => state.flowSlug);
  const flowStatus = useStore((state) => state.flowStatus);
  const canUserEditTeam = useStore((state) => state.canUserEditTeam);

  if (!params.flow) return null;

  return (
    <BreadcrumbsContainer>
      <BreadcrumbsRoot>
        {params.team && (
          <BreadcrumbsLink
            to="/app/$team"
            params={{
              team: params.team,
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
                team: team.slug,
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
      {params.flow && (
        <Box sx={(theme) => ({ color: theme.palette.text.primary })}>
          {canUserEditTeam && canUserEditTeam(team.slug) ? (
            <BreadcrumbsLink
              to="/app/$team/$flow/settings"
              params={{
                team: team.slug,
                flow: flowSlug,
              }}
              title="Update service status"
              sx={{ textDecoration: "none" }}
            >
              <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
                {flowStatus}
              </FlowTag>
            </BreadcrumbsLink>
          ) : (
            <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
              {flowStatus}
            </FlowTag>
          )}
        </Box>
      )}
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
