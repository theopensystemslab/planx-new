import DataFieldIcon from "@mui/icons-material/Code";
import DataFieldOffIcon from "@mui/icons-material/CodeOff";
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
    <Tooltip title="Toggle data fields" placement="right">
      <IconButton
        aria-label="Toggle data fields"
        onClick={toggleShowDataFields}
        size="large"
        sx={(theme) => ({
          background: theme.palette.background.paper,
          padding: theme.spacing(1),
          color: showDataFields
            ? theme.palette.text.primary
            : theme.palette.text.disabled,
          "&:hover": {
            background: theme.palette.common.white,
          },
        })}
      >
        {showDataFields ? <DataFieldIcon /> : <DataFieldOffIcon />}
      </IconButton>
    </Tooltip>
  );
};
