import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export const useStyles = makeStyles((theme) => ({
  key: {
    opacity: 0.8,
    backgroundColor: "inherit",
  },
}));

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
  const classes = useStyles();
  return (
    <ButtonBase selected={selected} {...props}>
      <Box display="flex" alignItems="center" flex={1} py={1.25} px={2}>
        <Typography variant="body2">{title}</Typography>
      </Box>
    </ButtonBase>
  );
};

export default DecisionButton;
