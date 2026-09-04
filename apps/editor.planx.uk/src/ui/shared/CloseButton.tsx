import CloseIcon from "@mui/icons-material/Close";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

const StyledIconButton = styled(IconButton)(({ theme, size }) => ({
  margin: "0 0 0 auto",
  padding: size === "small" ? theme.spacing(0.75) : theme.spacing(1),
  color: "inherit",
}));

export interface CloseButtonProps extends Omit<
  IconButtonProps,
  "title" | "aria-label" | "children" | "size"
> {
  /** Used as both the button title and the accessible name */
  title?: string;
  size?: "small" | "medium";
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  title = "Close",
  size,
  ...props
}) => (
  <StyledIconButton title={title} aria-label={title} size={size} {...props}>
    <CloseIcon
      sx={{ opacity: 0.8, fontSize: size === "small" ? "1.5rem" : "1.75rem" }}
    />
  </StyledIconButton>
);
