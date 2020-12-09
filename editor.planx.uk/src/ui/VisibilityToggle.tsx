import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
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
    <IconButton onClick={() => toggle()} style={{ height: 46 }}>
      {!props.visible ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
}
