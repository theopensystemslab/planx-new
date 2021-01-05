export default styled(Component)({
  width: "110px",
  height: "40px",
  background: "#0D6E6B",
  color: "#FFF",
  border: "none",
  size: "15px",
  textAlign: "center",
  cursor: "pointer",
});

import { styled } from "@material-ui/core/styles";
import React from "react";

function Component(props: any) {
  const { children, ...rest } = props;
  return <button {...rest}>{children}</button>;
}
