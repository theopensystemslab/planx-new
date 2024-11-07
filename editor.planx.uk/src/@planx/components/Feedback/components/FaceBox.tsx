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
    <Grid item xs={2.4} key={label}>
      <ToggleButton
        value={value}
        data-testid={testId}
        sx={{
          px: 0,
          width: "100%",
          textTransform: "none",
          "&[aria-pressed='true'] > div": {
            borderColor: (theme) => theme.palette.primary.dark,
            background: (theme) => theme.palette.background.paper,
          },
        }}
        disableRipple
      >
        <Box
          sx={(theme) => ({
            p: theme.spacing(2, 1),
            width: "100%",
            border: `2px solid ${theme.palette.border.main} `,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: theme.spacing(0.5),
          })}
        >
          <img src={icon} width={32} alt={altText} />
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.text.primary,
            })}
          >
            {label}
          </Typography>
        </Box>
      </ToggleButton>
    </Grid>
  );
};
