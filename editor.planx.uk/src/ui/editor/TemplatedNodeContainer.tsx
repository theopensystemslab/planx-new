import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import classNames from "classnames";
import React from "react";
import { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface TemplatedNodeContainerProps extends PropsWithChildren {
  isTemplatedNode: boolean;
  areTemplatedNodeInstructionsRequired: boolean;
  isComplete?: boolean;
  showStatusHeader?: boolean;
  className?: string;
}

const StyledContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "isTemplatedNode",
      "areTemplatedNodeInstructionsRequired",
      "isComplete",
    ].includes(prop as string),
})<{
  isTemplatedNode: boolean;
  areTemplatedNodeInstructionsRequired: boolean;
  isComplete?: boolean;
}>(({
  theme,
  isTemplatedNode,
  areTemplatedNodeInstructionsRequired,
  isComplete,
}) => {
  if (!isTemplatedNode) return {};

  const getBackgroundColor = () => {
    if (isComplete) return theme.palette.common.white;
    if (areTemplatedNodeInstructionsRequired)
      return theme.palette.template.dark;
    return theme.palette.template.main;
  };

  return {
    backgroundColor: getBackgroundColor(),
    width: "100%",
    padding: "4px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid",
    borderColor: "transparent",
    ...(isComplete && {
      borderColor: theme.palette.border.main,
    }),
  };
});

const StatusHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(0.5),
  width: "100%",
  padding: theme.spacing(0.5, 0.5, 0.75),
}));

const getTemplatedNodeStatus = (
  areTemplatedNodeInstructionsRequired?: boolean,
) => {
  if (areTemplatedNodeInstructionsRequired) return "Required";
  return "Optional";
};

const getStatusIcon = (theme: Theme, isComplete?: boolean) => {
  if (isComplete) {
    return { color: theme.palette.success.main };
  }
  return {
    color: theme.palette.text.primary,
    opacity: 0.2,
  };
};

export const TemplatedNodeContainer: React.FC<TemplatedNodeContainerProps> = ({
  children,
  isTemplatedNode = false,
  areTemplatedNodeInstructionsRequired = false,
  isComplete = false,
  showStatusHeader = false,
  className,
}) => {
  const containerClasses = classNames(
    "card-wrapper",
    {
      "template-card": isTemplatedNode,
    },
    className,
  );

  if (!isTemplatedNode) {
    return <Box className={containerClasses}>{children}</Box>;
  }

  return (
    <StyledContainer
      className={containerClasses}
      isTemplatedNode={isTemplatedNode}
      areTemplatedNodeInstructionsRequired={
        areTemplatedNodeInstructionsRequired
      }
      isComplete={isComplete}
    >
      {showStatusHeader && (
        <StatusHeader>
          <Typography
            variant="body3"
            sx={{
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
            }}
          >
            {getTemplatedNodeStatus(areTemplatedNodeInstructionsRequired)}
          </Typography>
          <CheckCircleIcon
            fontSize="small"
            sx={(theme) => getStatusIcon(theme, isComplete)}
          />
        </StatusHeader>
      )}
      {children}
    </StyledContainer>
  );
};
