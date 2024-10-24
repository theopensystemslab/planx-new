import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import React, { ReactElement } from "react";

interface FaceBoxProps {
  icon: string;
  label: string;
  altText: string;
  testId?: string;
  value: string;
}

export const FaceBox = ({
  icon,
  label,
  altText,
  testId,
  value,
}: FaceBoxProps): ReactElement => {
  return (
    <ToggleButton value={value} data-testid={testId}>
      <Box
        sx={{
          p: 2,
          border: "2px solid grey", // TODO get correct grey
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img src={icon} width={50} alt={altText} />
        <Typography variant="body2" pt={0.5}>
          {label}
        </Typography>
      </Box>
    </ToggleButton>
  );
};
