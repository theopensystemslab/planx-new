import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import React from "react";

const useStyles = makeStyles(() => ({
  errorsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 10,
  },
}));

export interface WarningMessagesProps {
  errors: string[];
}

const WarningMessages: React.FC<WarningMessagesProps> = ({ errors }) => {
  const classes = useStyles();

  return (
    <Box className={classes.errorsContainer} data-testid="error-container">
      {errors.map((message) => (
        <Alert severity="warning" data-testid="error-message" key={message}>
          <strong>Warning:</strong> {message}
        </Alert>
      ))}
    </Box>
  );
};

export default WarningMessages;
