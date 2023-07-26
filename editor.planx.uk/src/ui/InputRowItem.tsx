import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

interface Props {
  width?: number | string;
  children: JSX.Element[] | JSX.Element;
}

const Root = styled(Box)(({ width }: { width?: number | string }) => ({
  "& > *": {
    width: "100%",
  },
  ...(width && {
    maxWidth: width,
    flexBasis: width,
    "& .inputRowItem": {
      flexGrow: 0,
      flexShrink: 0,
    },
  }),
}));

export default function InputRowItem({ children, ...props }: Props): FCReturn {
  return (
    <Root className="inputRowItem" {...props}>
      {children}
    </Root>
  );
}
