import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  fullWidth?: boolean;
  handleSubmit?: () => any;
}

const useStyles = makeStyles<Theme>(() => ({
  container: {
    "& > * + *": {
      marginTop: 20,
    },
  },
}));

/**
 * Card which acts as a wrapper for public components
 * @param {object} props Component props
 * @param {bool} props.handleSubmit if included then show the Continue button
 * @param {bool} props.isValid if falsey then disable Continue button, otherwise enable
 * @param {bool} props.fullWidth if truthy then do not add padding to children
 */
const Card: React.FC<Props> = ({
  children,
  isValid = true,
  fullWidth = false,
  handleSubmit,
  ...props
}) => {
  const classes = useStyles();

  return (
    <Box
      className={classes.container}
      bgcolor="background.default"
      py={{ xs: 2, md: 4 }}
      px={fullWidth ? 0 : { xs: 2, md: 5 }}
      mb={4}
      width="100%"
      maxWidth={768}
      {...props}
    >
      {children}

      {handleSubmit && (
        <Box px={fullWidth ? { xs: 2, md: 5 } : 0}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={!isValid}
            onClick={async () => await handleSubmit()}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  );
};
export default Card;
