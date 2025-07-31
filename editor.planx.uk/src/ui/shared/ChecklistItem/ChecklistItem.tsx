import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";

import Checkbox from "../Checkbox/Checkbox";

const Root = styled(Box)(({ theme }) => ({
  width: "auto",
  justifySelf: "flex-start",
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
}));

const Label = styled(Typography)(({ theme }) => ({
  display: "flex",
  cursor: "pointer",
  padding: theme.spacing(0.75, 1.5),
  alignSelf: "flex-start",
})) as typeof Typography;

interface Props {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  variant?: "default" | "compact";
  disabled?: boolean;
}

export default function ChecklistItem({
  label,
  description,
  onChange,
  checked,
  id,
  inputProps,
  variant,
  disabled,
}: Props): FCReturn {
  return (
    <Root>
      <Checkbox
        checked={checked}
        id={id}
        onChange={onChange}
        inputProps={{
          ...inputProps,
          "aria-describedby": `checkbox-description-${id}`,
        }}
        variant={variant}
        disabled={disabled}
      />
      {description ? (
        <Box display="flex" flexDirection="column" width="100%">
          <Label
            variant="body1"
            color="text.primary"
            className="label"
            component={"label"}
            htmlFor={id}
            pb={0}
          >
            {label}
          </Label>
          <Typography
            id={`checkbox-description-${id}`}
            variant="body2"
            color="text.secondary"
            px={1.5}
          >
            {description}
          </Typography>
        </Box>
      ) : (
        <Label
          variant="body1"
          className="label"
          component={"label"}
          htmlFor={id}
        >
          {label}
        </Label>
      )}
    </Root>
  );
}
