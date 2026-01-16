import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Link as ReactNaviLink, useCurrentRoute } from "react-navi";
import { rootFlowPath } from "routes/utils";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  columnGap: 10,
  alignItems: "center",
}));

const BreadcrumbsLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.75)",
})) as typeof Link;

export interface BreadcrumbsProps {
  showEnvironmentSelect?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  showEnvironmentSelect = false,
}) => {
  const route = useCurrentRoute();
  const [team, isStandalone] = useStore((state) => [
    state.getTeam(),
    state.previewEnvironment === "standalone",
  ]);

  const flowStatus = useStore((state) => state.flowStatus);

  return (
    <>
      <BreadcrumbsRoot>
        <BreadcrumbsLink
          component={ReactNaviLink}
          href={"/"}
          prefetch={false}
          {...(isStandalone && { target: "_blank" })}
          variant="body1"
        >
          Plan✕
        </BreadcrumbsLink>
        {showEnvironmentSelect && <EnvironmentSelect />}
        {team.slug && (
          <>
            {" / "}
            <BreadcrumbsLink
              component={ReactNaviLink}
              href={`/${team.slug}`}
              prefetch={false}
              {...(isStandalone && { target: "_blank" })}
              variant="body1"
            >
              {team.slug}
            </BreadcrumbsLink>
          </>
        )}
        {route.data.flow && (
          <>
            {" / "}
            <Link
              style={{
                color: "#fff",
                textDecoration: "none",
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
    </>
  );
};

export default Breadcrumbs;
