import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useFormikContext } from "formik";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";

import type { LPSCategory, LPSListingFormValues } from "../types";

const CATEGORIES: { value: LPSCategory; label: string; description: string }[] =
  [
    {
      value: "apply",
      label: "Application service",
      description: "Submits a planning application to your back office system",
    },
    {
      value: "guidance",
      label: "Guidance service",
      description: "Provides users with guidance or other information",
    },
    {
      value: "notify",
      label: "Notification service",
      description: "Submits reports, complaints, requests, or notifications",
    },
  ];

const StyledFormLabel = styled(FormControlLabel)(({ theme }) => ({
  alignItems: "flex-start",
  margin: 0,
  padding: theme.spacing(1.5),
  border: "1px solid",
  width: "100%",
  '&[data-selected="true"]': {
    boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.default,
  },
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}));

const CategorySelection: React.FC = () => {
  const { values, handleChange } = useFormikContext<LPSListingFormValues>();

  return (
    <Box>
      <Typography variant="h4">Category</Typography>
      <SettingsDescription mt={0}>
        Select how your service will be categorised.
      </SettingsDescription>
      <RadioGroup
        name="category"
        value={values.category}
        onChange={handleChange}
        sx={{ gap: 2 }}
      >
        {CATEGORIES.map((option) => (
          <StyledFormLabel
            data-selected={values.category === option.value}
            key={option.value}
            value={option.value}
            control={<Radio sx={{ alignSelf: "flex-start", mt: 0.5 }} />}
            label={
              <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {option.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default CategorySelection;
