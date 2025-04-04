import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ButtonBase, { ButtonBaseProps } from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface AddButtonProps extends ButtonBaseProps {
  size?: "small" | "medium";
}

const AddButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== "size",
})<AddButtonProps>(({ theme, size }) => ({
  fontSize: size === "small" ? 18 : 20,
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  color: theme.palette.primary.main,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export function AddButton({
  children,
  onClick,
  size = "medium",
}: {
  children: string;
  onClick: () => void;
  size?: "small" | "medium";
}): FCReturn {
  return (
    <AddButtonRoot onClick={onClick} size={size}>
      <AddCircleOutlineIcon
        sx={{ mr: 1, fontSize: size === "small" ? 20 : 24 }}
      />{" "}
      {children}
    </AddButtonRoot>
  );
}
