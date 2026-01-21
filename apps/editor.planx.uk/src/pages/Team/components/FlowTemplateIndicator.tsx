import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface Props {
  isSourceTemplate: boolean;
  isTemplatedFlow: boolean;
  teamName?: string;
}

export const FlowTemplateIndicator: React.FC<Props> = ({
  isSourceTemplate,
  isTemplatedFlow,
  teamName,
}) => {
  if (!isSourceTemplate && !isTemplatedFlow) return null;

  const text = isSourceTemplate ? "Source template" : `${teamName}`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      {isTemplatedFlow && (
        <StarIcon sx={{ color: "#380F77", fontSize: "1rem" }} />
      )}
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {text}
      </Typography>
    </Box>
  );
};
