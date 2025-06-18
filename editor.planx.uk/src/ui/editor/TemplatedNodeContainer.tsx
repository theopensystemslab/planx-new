import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface TemplatedNodeContainerProps {
  children: React.ReactNode;
  isTemplatedNode?: boolean;
  areTemplatedNodeInstructionsRequired?: boolean;
  isComplete?: boolean;
  showStatusHeader?: boolean;
  className?: string;
  sx?: any;
}

const StyledContainer = styled(Box)<{
  isTemplatedNode?: boolean;
  areTemplatedNodeInstructionsRequired?: boolean;
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
    ...(isComplete && {
      border: "1px solid",
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
  isComplete?: boolean,
  areTemplatedNodeInstructionsRequired?: boolean,
) => {
  if (areTemplatedNodeInstructionsRequired) return "Required";
  return "Optional";
};

const getStatusIcon = (theme: any, isComplete?: boolean) => {
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
  sx = {},
}) => {
  if (!isTemplatedNode) {
    return (
      <Box className={className} sx={sx}>
        {children}
      </Box>
    );
  }

  return (
    <StyledContainer
      className={className}
      isTemplatedNode={isTemplatedNode}
      areTemplatedNodeInstructionsRequired={
        areTemplatedNodeInstructionsRequired
      }
      isComplete={isComplete}
      sx={sx}
    >
      {showStatusHeader && (
        <StatusHeader>
          <Typography
            variant="body3"
            sx={{
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
            }}
          >
            {getTemplatedNodeStatus(
              isComplete,
              areTemplatedNodeInstructionsRequired,
            )}
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
