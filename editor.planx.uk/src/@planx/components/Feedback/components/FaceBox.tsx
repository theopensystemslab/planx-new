import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
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
    <Grid item xs={2} key={label}>
      <ToggleButton
        value={value}
        data-testid={testId}
        sx={{ px: 0 }}
        disableRipple
      >
        <Box
          sx={(theme) => ({
            p: theme.spacing(2),
            border: `2px solid ${theme.palette.border.main} `,
            width: "120px",
            maxHeight: "120px",
          })}
        >
          <img src={icon} width={50} alt={altText} />
          <Typography variant="body2" pt={0.5}>
            {label}
          </Typography>
        </Box>
      </ToggleButton>
    </Grid>
  );
};
