import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import React from "react";

export interface Props {
  visible: boolean;
  onChange: (newVisible: boolean) => void;
}

export default function VisibilityToggle(props: Props): FCReturn {
  const toggle = () => {
    props.onChange(!props.visible);
  };
  return (
    <IconButton
      onClick={() => toggle()}
      style={{ height: 46 }}
      aria-label="Toggle visibility"
      size="large"
    >
      {!props.visible ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
}
