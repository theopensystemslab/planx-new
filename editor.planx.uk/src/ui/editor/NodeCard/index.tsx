import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { getDisplayDetails } from "./getDisplayDetails";

const Root = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "portalId",
})<{ portalId?: string }>(({ theme, portalId }) => ({
  border: `1px solid ${theme.palette.common.black}`,
  display: "block",
  padding: 0,
  borderWidth: portalId ? 4 : 2,
}));

const HeaderRoot = styled(Box)(({ theme }) => ({
  padding: [theme.spacing(1), theme.spacing(0.5)],
  display: "flex",
  alignItems: "center",
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
  width: "100%",
  borderColor: theme.palette.common.black,
  borderWidth: 4,
}));

const InternalPortalHeader: React.FC<{ portalId: string }> = ({ portalId }) => {
  const portalName = useStore((state) => state.flow)[portalId].data?.text;
  const Icon = ICONS[ComponentType.InternalPortal];

  return (
    <HeaderRoot>
      {Icon && <Icon />}
      <Typography
        variant="body2"
        fontSize={14}
        fontWeight={FONT_WEIGHT_SEMI_BOLD}
        ml={1}
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
export const NodeCard: React.FC<Props> = ({ nodeId, children, backgroundColor }) => {
  const [orderedFlow, getURLForNode] = useStore((state) => [
    state.orderedFlow,
    state.getURLForNode,
  ]);

  if (!orderedFlow) throw Error("An ordered flow is required to display a NodeCard");

  const node = orderedFlow?.find(({ id }) => id === nodeId);
  if (!node) throw Error(`Invalid node. Cannot find node ${nodeId} on this flow`);

  const { navigate } = useNavigation();

  const { iconKey, componentType, title } =
    getDisplayDetails(node);
  const Icon = ICONS[iconKey];
  
  const portalId = node.internalPortalId;

  const handleClick = () => {
    const url = getURLForNode(node.id);
    navigate(url);
  };

  return (
    <Root
      onClick={handleClick}
      portalId={portalId}
      disableRipple
      sx={(theme) => ({ backgroundColor: backgroundColor || theme.palette.background.paper })}
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
        { children && <Box mt={1}>{ children }</Box> }
      </Box>
    </Root>
  );
};
