import DataFieldIcon from "@mui/icons-material/AutoFixNormal";
import DataFieldOffIcon from "@mui/icons-material/AutoFixOff";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const ToggleDataFieldsButton: React.FC = () => {
  const [showDataFields, toggleShowDataFields] = useStore((state) => [
    state.showDataFields,
    state.toggleShowDataFields,
  ]);

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(6),
        left: theme.spacing(7),
        zIndex: theme.zIndex.appBar,
        border: `1px solid ${theme.palette.border.main}`,
        borderRadius: "3px",
        background: theme.palette.background.paper,
      })}
    >
      <Tooltip title="Toggle data fields" placement="right">
        <IconButton
          aria-label="Toggle data fields"
          onClick={toggleShowDataFields}
          size="large"
          sx={(theme) => ({
            padding: theme.spacing(1),
            color: showDataFields
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          })}
        >
          {showDataFields ? <DataFieldIcon /> : <DataFieldOffIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
