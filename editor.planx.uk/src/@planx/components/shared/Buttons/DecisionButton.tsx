import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export const useStyles = makeStyles((theme) => ({
  key: {
    opacity: 0.5,
  },
}));

interface Props extends ButtonProps {
  response: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  };
}

const DecisionButton: React.FC<Props> = ({ response, selected, ...props }) => {
  const classes = useStyles();
  return (
    <ButtonBase selected={selected} {...props}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}
        py={1}
        px={2}
      >
        <Typography variant="body2">{response.title}</Typography>
        <Box className={classes.key}>{response.responseKey.toUpperCase()}</Box>
      </Box>
    </ButtonBase>
  );
};

export default DecisionButton;
