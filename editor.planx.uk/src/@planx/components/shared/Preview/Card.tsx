import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Container from "@material-ui/core/Container";
import Fade from "@material-ui/core/Fade";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { getCookie } from "lib/cookie";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { linkStyle } from "theme";
import { ApplicationPath } from "types";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  handleSubmit?: (data?: any) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    "& > * + *": {
      marginTop: theme.spacing(2.5),
    },
  },
  saveResumeButton: {
    ...linkStyle,
    marginTop: theme.spacing(2.5),
  },
}));

const sendNotifyEmail = async (saveToEmail: string | undefined) => {
  if (!saveToEmail) console.error("Email is required to save");
  const url = `${process.env.REACT_APP_API_URL}/save-application`;
  const flowId = useStore.getState().id;
  // TODO: Type for this
  const data = { email: saveToEmail, flowId: flowId };
  const token = getCookie("jwt");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.post(url, data, config);
};

const SaveResumeButton: React.FC = () => {
  const classes = useStyles();
  const saveToEmail = useStore((state) => state.saveToEmail);
  const onClick = () => (Boolean(saveToEmail) ? save() : resume());

  const save = async () => {
    // TODO: Save session to db

    try {
      await sendNotifyEmail(saveToEmail);
      useStore.getState().setPath(ApplicationPath.Save);
    } catch (error) {
      console.error(error);
      // TODO: Handle error visually?
    }
  };

  const resume = () => useStore.getState().setPath(ApplicationPath.Resume);

  return (
    <>
      <Typography variant="body2">or</Typography>
      <ButtonBase className={classes.saveResumeButton} onClick={onClick}>
        <Typography variant="body2">
          {Boolean(saveToEmail)
            ? "Save and return to this application later"
            : "Resume an application you have already started"}
        </Typography>
      </ButtonBase>
    </>
  );
};

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
  const path = useStore((state) => state.path);
  const showSaveResumeButton = path === ApplicationPath.SaveAndReturn;

  return (
    <Fade in={true} timeout={theme.transitions.duration.enteringScreen}>
      <Container maxWidth="md">
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
              data-testid="continue-button"
            >
              Continue
            </Button>
          )}
          {showSaveResumeButton && <SaveResumeButton />}
        </Box>
      </Container>
    </Fade>
  );
};
export default Card;
