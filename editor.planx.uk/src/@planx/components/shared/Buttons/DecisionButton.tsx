import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export interface Props extends ButtonProps {
  id?: string;
  responseKey?: string | number;
  title: string;
  description?: string;
}

const DecisionButton: React.FC<Props> = ({
  responseKey,
  title,
  selected,
  ...props
}) => {
  return (
    <ButtonBase selected={selected} {...props}>
      <Box display="flex" alignItems="center" flex={1} py={1.25} px={2}>
        <Typography variant="body2">{title}</Typography>
      </Box>
    </ButtonBase>
  );
};

export default DecisionButton;
