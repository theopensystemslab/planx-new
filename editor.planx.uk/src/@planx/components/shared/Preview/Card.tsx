import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";

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
 * @param {bool} props.handleBackClick if included then show the Back button
 * @param {bool} props.handleSubmit if included then show the Continue button
 * @param {bool} props.isValid if falsey then disable Continue button, otherwise enable
 */
const Card: React.FC<any> = ({
  children,
  isValid = true,
  handleBackClick,
  inner = false,
  handleSubmit,
  ...props
}) => {
  const classes = useStyles();

  return (
    <>
      {handleBackClick && (
        <span
          onClick={() => handleBackClick()}
          style={{
            padding: "0 10px 10px",
            display: "block",
            cursor: "pointer",
            userSelect: "none",
            alignSelf: "start",
          }}
        >
          ⭠ Back
        </span>
      )}
      <Box
        className={classes.container}
        bgcolor="background.default"
        py={{ xs: 2, md: 4 }}
        px={{ xs: 2, md: 5 }}
        mb={4}
        width="100%"
        maxWidth={768}
        {...props}
      >
        {children}
      </Box>
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
    </>
  );
};
export default Card;
