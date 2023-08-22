import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "childRow",
})<BoxProps & { childRow?: boolean }>(({ childRow }) => ({
  display: "flex",
  width: "100%",
  "&:not(:last-child)": {
    marginBottom: 2,
  },
  "& > *": {
    flexGrow: 1,
    marginLeft: 1,
    marginRight: 1,
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: 0,
    },
  },
  ...(childRow && {
    paddingLeft: 52,
    position: "relative",
  }),
}));

interface Props {
  childRow?: boolean;
  children: React.ReactNode;
}

export default function InputRow({ children, childRow }: Props): FCReturn {
  return <Root childRow={childRow}>{children}</Root>;
}
