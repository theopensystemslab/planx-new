import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useParams } from "@tanstack/react-router";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  columnGap: 10,
  alignItems: "center",
}));

const BreadcrumbsLink = styled(CustomLink)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.75)",
})) as typeof CustomLink;

export interface BreadcrumbsProps {
  showEnvironmentSelect?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  showEnvironmentSelect = false,
}) => {
  const params = useParams({ strict: false });
  const team = useStore((state) => state.getTeam());
  const isStandalone = useStore(
    (state) => state.previewEnvironment === "standalone",
  );
  const flowSlug = useStore((state) => state.flowSlug);
  const flowStatus = useStore((state) => state.flowStatus);
  const canUserEditTeam = useStore((state) => state.canUserEditTeam);

  return (
    <>
      <BreadcrumbsRoot>
        <BreadcrumbsLink
          to="/app"
          {...(isStandalone && { target: "_blank" })}
          variant="body1"
        >
          Plan✕
        </BreadcrumbsLink>
        {showEnvironmentSelect && <EnvironmentSelect />}
        {params.team && (
          <>
            {" / "}
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
          </>
        )}
        {params.flow && (
          <>
            {" / "}
            <BreadcrumbsLink
              to="/$team/$flow"
              params={{
                team: team.slug,
                flow: flowSlug,
              }}
              {...(isStandalone && { target: "_blank" })}
              variant="body1"
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
    </>
  );
};

export default Breadcrumbs;
