import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useId } from "react";

const StyledWarningContainer = styled(Box)<BoxProps>(({ theme }) => ({
  border: `solid 2px ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}));

export const WarningContainer = ({
  "aria-labelledby": ariaLabelledBy,
  children,
  ...props
}: BoxProps) => {
  const warningLabelId = useId();
  const labelledBy = [warningLabelId, ariaLabelledBy].filter(Boolean).join(" ");

  return (
    <StyledWarningContainer
      component="section"
      aria-labelledby={labelledBy}
      {...props}
    >
      <span id={warningLabelId} style={visuallyHidden}>
        Warning:
      </span>
      {children}
    </StyledWarningContainer>
  );
};
