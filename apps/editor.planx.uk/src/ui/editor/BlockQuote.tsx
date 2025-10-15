import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const StyledBlockQuote = styled("blockquote")(({ theme }) => ({
  display: "block",
  width: "100%",
  position: "relative",
  padding: theme.spacing(0.5, 0, 0.5, 0.5),
  margin: 0,
  fontStyle: "italic",
  color: "inherit",
}));

export default function BlockQuote({ children }: { children: ReactNode }) {
  return (
    <StyledBlockQuote>
      <Typography variant="body2" component="span">
        {children}
      </Typography>
    </StyledBlockQuote>
  );
}
