import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import { getCookie } from "lib/cookie";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { linkStyle } from "theme";
import { ApplicationPath } from "types";
import ErrorWrapper from "ui/ErrorWrapper";

const useStyles = makeStyles<Theme>(() => ({
  saveResumeButton: {
    ...linkStyle,
  },
}));

const sendNotifyEmail = async (saveToEmail: string | undefined) => {
  if (!saveToEmail) console.error("Email is required to save");
  const url = `${process.env.REACT_APP_API_URL}/save-application`;
  const flowId = useStore.getState().id;
  // TODO: Type for this?
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
  const [error, setError] = useState<string>();

  const saveToEmail = useStore((state) => state.saveToEmail);
  const onClick = () => (Boolean(saveToEmail) ? save() : resume());

  const save = async () => {
    // TODO: Save session to db, handle save error

    try {
      await sendNotifyEmail(saveToEmail);
      useStore.getState().setPath(ApplicationPath.Save);
    } catch (error) {
      // Option 1: Notify failure
      // Option 2: API failure
      console.error(error);
      setError("Something went wrong");
    }
  };

  const resume = () => useStore.getState().setPath(ApplicationPath.Resume);

  return (
    <>
      <Typography variant="body2">or</Typography>
      <ErrorWrapper error={error}>
        <ButtonBase className={classes.saveResumeButton} onClick={onClick}>
          <Typography variant="body2">
            {Boolean(saveToEmail)
              ? "Save and return to this application later"
              : "Resume an application you have already started"}
          </Typography>
        </ButtonBase>
      </ErrorWrapper>
    </>
  );
};

export default SaveResumeButton;
