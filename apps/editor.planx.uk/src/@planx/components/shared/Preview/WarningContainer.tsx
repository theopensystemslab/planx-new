import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { type ReactNode, useId } from "react";

export const WarningContainerRoot = styled(Box)<BoxProps>(({ theme }) => ({
  border: `solid 2px ${theme.palette.warning.dark}`,
  backgroundColor: theme.palette.warning.light,
  padding: theme.spacing(2, 2.5, 2, 2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadiusLg,
}));

interface WarningContainerProps extends Pick<BoxProps, "sx"> {
  children: ReactNode;
  icon?: typeof SvgIcon;
}

export const WarningContainer = ({
  children,
  icon: Icon,
  sx,
}: WarningContainerProps) => {
  const warningLabelId = useId();
  const textId = useId();

  return (
    <WarningContainerRoot
      component="section"
      aria-labelledby={`${warningLabelId} ${textId}`}
      sx={sx}
    >
      <span id={warningLabelId} style={visuallyHidden}>
        Warning:
      </span>
      {Icon && <Icon aria-hidden="true" />}
      <Typography
        id={textId}
        variant="body2"
        component="div"
        sx={{ "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }}
      >
        {children}
      </Typography>
    </WarningContainerRoot>
  );
};
