import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

export default function MoreInfoIcon() {
  const Root = styled(Box)(({ theme }) => ({
    border: `3px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    borderRadius: "50%",
    height: 32,
    width: 32,
    padding: 0,
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "white",
      borderColor: theme.palette.primary.main,
    },
  }));

  return (
    <Root>
      <QuestionMarkIcon
        sx={{
          position: "absolute",
          left: 3,
          top: 0,
          width: 20,
        }}
      />
    </Root>
  );
}
