import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import classNames from "classnames";
import React from "react";
import { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

interface TemplatedNodeContainerProps extends PropsWithChildren {
  isTemplatedNode: boolean;
  areTemplatedNodeInstructionsRequired: boolean;
  isComplete?: boolean;
  showStatus?: boolean;
  className?: string;
}

const StyledContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "isTemplatedNode",
      "areTemplatedNodeInstructionsRequired",
      "isComplete",
      "showStatus",
    ].includes(prop as string),
})<{
  isTemplatedNode: boolean;
  areTemplatedNodeInstructionsRequired: boolean;
  isComplete?: boolean;
  showStatus?: boolean;
}>(({
  theme,
  isTemplatedNode,
  areTemplatedNodeInstructionsRequired,
  isComplete,
  showStatus,
}) => {
  if (!isTemplatedNode) return {};

  let backgroundColor;
  if (showStatus) {
    if (isComplete) {
      backgroundColor = theme.palette.common.white;
    } else if (areTemplatedNodeInstructionsRequired) {
      backgroundColor = theme.palette.template.dark;
    } else {
      backgroundColor = theme.palette.template.main;
    }
  }

  return {
    backgroundColor,
    width: "100%",
    ...(showStatus && {
      padding: "4px",
    }),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid",
    borderColor: "transparent",
    ...(isComplete &&
      showStatus && {
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

export const TemplatedNodeContainer: React.FC<TemplatedNodeContainerProps> = ({
  children,
  isTemplatedNode = false,
  areTemplatedNodeInstructionsRequired = false,
  isComplete = false,
  showStatus = false,
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
      showStatus={showStatus}
    >
      {showStatus && (
        <StatusHeader>
          <Typography
            variant="body3"
            sx={{
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
            }}
          >
            {getTemplatedNodeStatus(areTemplatedNodeInstructionsRequired)}
          </Typography>
          {isComplete && (
            <CheckCircleIcon
              fontSize="small"
              sx={(theme) => ({ color: theme.palette.success.main })}
            />
          )}
        </StatusHeader>
      )}
      {children}
    </StyledContainer>
  );
};
