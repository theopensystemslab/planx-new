import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { useFormikContext } from "formik";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import type { LPSCategory, LPSListingFormValues } from "../types";

const CATEGORIES: { value: LPSCategory; label: string; description: string }[] =
  [
    {
      value: "apply",
      label: "Application service",
      description:
        "Submits a planning application to your selected 'Send' destinations",
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

const CategoryLabel: React.FC<(typeof CATEGORIES)[number]> = ({
  label,
  description,
}) => (
  <>
    <Typography variant="body2" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </>
);

const CategorySelection: React.FC = () => {
  const { values, handleChange, setFieldValue, errors } =
    useFormikContext<LPSListingFormValues>();

  // Only show if LPS is toggled on
  if (!values.isListedOnLPS) return null;

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    setFieldValue("category", target.value);
  };

  return (
    <Box>
      <Typography variant="h4">Category</Typography>
      <SettingsDescription mt={0}>
        Which of the following categories best describes your service?
      </SettingsDescription>
      <ErrorWrapper error={errors.category}>
        <RadioGroup
          name="category"
          value={values.category}
          onChange={handleChange}
          sx={{ gap: 2 }}
        >
          <FormControl component="fieldset">
            <RadioGroup value={values.category} sx={{ gap: 1 }}>
              {CATEGORIES.map((option) => (
                <BasicRadio
                  key={option.value}
                  id={option.value}
                  label={<CategoryLabel {...option} />}
                  variant="compact"
                  value={option.value}
                  onChange={handleRadioChange}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </RadioGroup>
      </ErrorWrapper>
    </Box>
  );
};

export default CategorySelection;
