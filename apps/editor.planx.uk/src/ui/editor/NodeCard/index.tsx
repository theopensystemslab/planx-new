import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ICONS } from "@planx/components/shared/icons";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { getDisplayDetailsForNodeCard } from "./getDisplayDetailsForNodeCard";

const Root = styled(ListItemButton, {
  shouldForwardProp: (prop) =>
    !["portalId", "backgroundColor"].includes(prop as string),
})<{ portalId?: string; backgroundColor?: string }>(
  ({ theme, portalId, backgroundColor }) => ({
    border: `1px solid ${theme.palette.text.primary}`,
    display: "block",
    maxWidth: "100%",
    padding: 0,
    borderWidth: portalId ? 4 : 2,
    backgroundColor,
    ...(backgroundColor && {
      "&:hover": {
        backgroundColor: alpha(backgroundColor, 0.7),
      },
    }),
  }),
);

const HeaderRoot = styled(Box)(({ theme }) => ({
  padding: [theme.spacing(1), theme.spacing(0.5)],
  display: "flex",
  alignItems: "center",
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.common.white,
  width: "100%",
  borderColor: theme.palette.text.primary,
  borderWidth: 4,
}));

const InternalPortalHeader: React.FC<{ portalId: string }> = ({ portalId }) => {
  const portalName = useStore((state) => state.flow)[portalId].data?.text;

  return (
    <HeaderRoot className="node-card portal internal-portal">
      <Typography
        variant="body2"
        fontSize={14}
        fontWeight={FONT_WEIGHT_SEMI_BOLD}
      >
        {portalName}
      </Typography>
    </HeaderRoot>
  );
};

interface Props extends PropsWithChildren {
  nodeId: string;
  backgroundColor?: string;
}

/**
 * Re-usable component that is responsible for the following -
 *  - Display nodes in a standard format (title, icon, etc)
 *  - Links to Editor modal for specific node
 */
export const NodeCard: React.FC<Props> = ({
  nodeId,
  children,
  backgroundColor,
}) => {
  const navigate = useNavigate();
  const [orderedFlow, getURLForNode] = useStore((state) => [
    state.orderedFlow,
    state.getURLForNode,
  ]);

  if (!orderedFlow) return;

  const node = orderedFlow?.find(({ id }) => id === nodeId);
  if (!node) return;

  const { iconKey, componentType, title } = getDisplayDetailsForNodeCard(node);
  const Icon = ICONS[iconKey];

  const portalId = node.internalPortalId;

  const handleClick = () => {
    const url = getURLForNode(node.id);
    navigate({ to: url });
  };

  return (
    <Root
      onClick={handleClick}
      portalId={portalId}
      disableRipple
      backgroundColor={backgroundColor}
    >
      {portalId && <InternalPortalHeader portalId={portalId} />}
      <Box p={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {Icon && <Icon />}
          <Typography
            variant="body2"
            fontSize={14}
            fontWeight={FONT_WEIGHT_SEMI_BOLD}
            ml={1}
          >
            {componentType}
          </Typography>
          {title && (
            <Typography
              variant="body2"
              fontSize={14}
              ml={0.5}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {` • ${title}`}
            </Typography>
          )}
        </Box>
        {children && <Box mt={1}>{children}</Box>}
      </Box>
    </Root>
  );
};
