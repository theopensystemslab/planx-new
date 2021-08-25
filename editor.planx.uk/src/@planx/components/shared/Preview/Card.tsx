import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Fade from "@material-ui/core/Fade";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import React from "react";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  handleSubmit?: (data?: any) => void;
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
 */
const Card: React.FC<Props> = ({
  children,
  isValid = true,
  handleSubmit,
  ...props
}) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Fade in={true} timeout={theme.transitions.duration.enteringScreen}>
      <Container maxWidth="md" role="main">
        <Box
          className={classes.container}
          bgcolor="background.default"
          py={{ xs: 2, md: 4 }}
          px={{ xs: 2, md: 0 }}
          mb={4}
          {...props}
        >
          {children}

          {handleSubmit && (
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
          )}
        </Box>
      </Container>
    </Fade>
  );
};
export default Card;
