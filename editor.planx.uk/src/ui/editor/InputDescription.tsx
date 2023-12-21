import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Description = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
})) as typeof Typography;

export default function InputDescription({
  children,
}: {
  children: ReactNode;
}) {
  return <Description variant="body2">{children}</Description>;
}
