import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import React from "react";

export interface Props {
  visible: boolean;
  onChange: (newVisible: boolean) => void;
}

const VisibilityToggle: React.FC<Props> = (props) => {
  const toggle = () => {
    props.onChange(!props.visible);
  };
  return (
    <IconButton
      onClick={() => toggle()}
      style={{ height: 46 }}
      // style={{ backgroundColor: visible ? "transparent" : "#fff", height: 46 }}
    >
      {!props.visible ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
};

export default VisibilityToggle;
