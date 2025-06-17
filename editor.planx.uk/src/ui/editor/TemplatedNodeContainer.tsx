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
  justifyContent: "center",
  gap: theme.spacing(0.5),
  width: "100%",
  padding: theme.spacing(0.5),
}));

const getTemplatedNodeStatus = (
  isComplete?: boolean,
  areTemplatedNodeInstructionsRequired?: boolean,
) => {
  if (isComplete) return "Done";
  if (areTemplatedNodeInstructionsRequired) return "Required";
  return "Optional";
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

  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircleIcon color="success" fontSize="small" />;
    }
    return undefined;
  };

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
          {getStatusIcon()}
          <Typography
            variant="body3"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            {getTemplatedNodeStatus(
              isComplete,
              areTemplatedNodeInstructionsRequired,
            )}
          </Typography>
        </StatusHeader>
      )}
      {children}
    </StyledContainer>
  );
};
