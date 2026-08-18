import Box from "@mui/material/Box";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import { formControlLabelClasses } from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id?: string | boolean;
  label: FormControlLabelProps["label"];
  description?: string;
  onChange: FormControlLabelProps["onChange"];
  variant?: "default" | "compact" | "inline";
  value?: string;
  disabled?: boolean;
}

const getLabel = (
  label: FormControlLabelProps["label"],
  description: string | undefined,
  variant: NonNullable<Props["variant"]>,
) => {
  if (!description) return label;

  if (variant === "inline") {
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <Box sx={{ fontWeight: "bold" }}>{label}</Box>
        <Box sx={{ color: "text.secondary" }}>–</Box>
        <Box sx={{ color: "text.secondary" }}>{description}</Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ fontWeight: "bold", mb: 1 }}>{label}</Box>
      <Box sx={{ color: "text.secondary" }}>{description}</Box>
    </Box>
  );
};

const BasicRadio: React.FC<Props> = ({
  id,
  onChange,
  label,
  description,
  variant = "default",
  disabled,
}) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio variant={variant === "inline" ? "compact" : variant} />}
    label={getLabel(label, description, variant)}
    disabled={disabled}
    sx={(theme) => ({
      ml: theme.spacing(-1),
      mb: variant === "default" ? 1 : 0,
      alignItems: "flex-start",
      [`& .${formControlLabelClasses.label}`]: {
        paddingTop: theme.spacing(0.95),
      },
    })}
  />
);

export default BasicRadio;
