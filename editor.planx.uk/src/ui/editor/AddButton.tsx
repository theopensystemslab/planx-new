import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ButtonBase from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React, {  } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const AddButtonRoot = styled(ButtonBase)(({ theme }) => ({
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  color: theme.palette.primary.main,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export function AddButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}): FCReturn {
  return (
    <AddButtonRoot onClick={onClick}>
      <AddCircleOutlineIcon sx={{ mr: 1 }} /> {children}
    </AddButtonRoot>
  );
}