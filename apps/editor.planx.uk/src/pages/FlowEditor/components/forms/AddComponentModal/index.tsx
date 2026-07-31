import Popover from "@mui/material/Popover";
import { useNavigate, useParams } from "@tanstack/react-router";
import React, { useCallback } from "react";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { getNodeRoute } from "utils/routeUtils/utils";

import { componentListFrameSx, ComponentsTab } from "./ComponentsTab";

interface Props {
  anchorEl: HTMLElement | null;
  parent?: string;
  before?: string;
  onClose: () => void;
}

const AddComponentModal: React.FC<Props> = ({
  anchorEl,
  parent,
  before,
  onClose,
}) => {
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const handleSelect = useCallback(
    (slug: string) => {
      onClose();
      navigate({
        to: getNodeRoute(parent, before),
        params: {
          team,
          flow,
          ...(parent && { parent }),
          ...(before && { before }),
        },
        search: { type: slug as NodeSearchParams["type"] },
      });
    },
    [navigate, team, flow, parent, before, onClose],
  );

  // Flip the popover above the hanger when there isn't room below it
  const rect = anchorEl?.getBoundingClientRect();
  const showBelow = !rect || window.innerHeight - rect.bottom >= 450;

  return (
    <Popover
      open
      onClose={onClose}
      data-testid="add-component-modal"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: showBelow ? "bottom" : "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: showBelow ? "top" : "bottom",
        horizontal: "center",
      }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: { ...componentListFrameSx, mt: showBelow ? "4px" : "-4px" },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
        },
      }}
    >
      <ComponentsTab onSelect={handleSelect} />
    </Popover>
  );
};

export default AddComponentModal;
