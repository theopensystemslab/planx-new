import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import React from "react";

const VisibilityToggle = ({ toggleVisibility }) => {
  const [visible, setVisible] = React.useState(true);
  const toggle = () => {
    setVisible(!visible);
    toggleVisibility(visible);
  };
  return (
    <IconButton
      onClick={() => toggle()}
      style={{ height: 46 }}
      // style={{ backgroundColor: visible ? "transparent" : "#fff", height: 46 }}
    >
      {!visible ? <Visibility /> : <VisibilityOff />}
    </IconButton>
  );
};
export default VisibilityToggle;
