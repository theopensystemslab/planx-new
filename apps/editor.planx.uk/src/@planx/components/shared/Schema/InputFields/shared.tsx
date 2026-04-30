import Typography from "@mui/material/Typography";
import React from "react";

interface FieldInputDescriptionProps {
  description: string;
}

export const FieldInputDescription: React.FC<FieldInputDescriptionProps> = ({
  description,
}) => (
  <Typography variant="body2" sx={{ mb: 1.5 }}>
    {description}
  </Typography>
);
