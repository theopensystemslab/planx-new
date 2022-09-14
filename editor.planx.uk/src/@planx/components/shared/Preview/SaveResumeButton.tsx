import ButtonBase from "@mui/material/ButtonBase";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { linkStyle } from "theme";
import { ApplicationPath } from "types";

const useStyles = makeStyles<Theme>(() => ({
  saveResumeButton: {
    ...linkStyle,
  },
}));

const SaveResumeButton: React.FC = () => {
  const classes = useStyles();

  const saveToEmail = useStore((state) => state.saveToEmail);
  const onClick = () =>
    useStore.setState({
      path: Boolean(saveToEmail)
        ? ApplicationPath.Save
        : ApplicationPath.Resume,
    });

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

export default SaveResumeButton;
