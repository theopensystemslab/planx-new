import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Link as ReactNaviLink, useCurrentRoute } from "react-navi";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: 60,
  zIndex: 1200,
  backgroundColor: `rgba(255, 255, 255, 0.2)`,
  padding: theme.spacing(0, 1.75),
  borderRadius: 50,
  backdropFilter: "blur(10px)",
}));

const BreadcrumbsRoot = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const BreadcrumbsLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  borderBottom: `1px solid ${theme.palette.text.primary}`,
  fontWeight: "inherit",
})) as typeof Link;

const Breadcrumbs: React.FC = () => {
  const route = useCurrentRoute();
  const [team, isStandalone] = useStore((state) => [
    state.getTeam(),
    state.previewEnvironment === "standalone",
  ]);

  const flowStatus = useStore((state) => state.flowStatus);

  return (
    <BreadcrumbsContainer>
      <BreadcrumbsRoot>
        {team.slug && (
          <BreadcrumbsLink
            component={ReactNaviLink}
            href={`/${team.slug}`}
            prefetch={false}
            {...(isStandalone && { target: "_blank" })}
            variant="body1"
          >
            {team.slug}
          </BreadcrumbsLink>
        )}
        {route.data.flow && (
          <>
            {" / "}
            <Link
              sx={{
                color: (theme) => theme.palette.text.primary,
                textDecoration: "none",
                fontWeight: "inherit",
                borderBottom: `1px solid transparent`,
              }}
              component={ReactNaviLink}
              href={rootFlowPath(false)}
              prefetch={false}
              variant="body1"
            >
              {route.data.flow}
            </Link>
          </>
        )}
      </BreadcrumbsRoot>
      {route.data.flow && (
        <Box sx={(theme) => ({ color: theme.palette.text.primary })}>
          {useStore.getState().canUserEditTeam(team.slug) ? (
            <Button
              variant="link"
              href={`/${team.slug}/${route.data.flow}/settings`}
              title="Update service status"
              sx={{ textDecoration: "none" }}
            >
              <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
                {flowStatus}
              </FlowTag>
            </Button>
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
