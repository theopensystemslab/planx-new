import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { visuallyHidden } from "@material-ui/utils";
import React from "react";
import { useState } from "react";
import { TeamSettings } from "types";
import { fetchCurrentTeam } from "utils";

const useClasses = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "end",
  },
  button: {
    padding: theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  externalLink: {
    textDecoration: "none",
  },
}));

interface Props {
  teamSettings?: TeamSettings;
}

export default function ExternalPlanningSiteDialog({
  teamSettings,
}: Props): FCReturn {
  const classes = useClasses();
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const settings = teamSettings || fetchCurrentTeam()?.settings;
  return (
    <>
      {isOpen && (
        <Dialog open onClose={toggleModal}>
          <DialogTitle>The site does not have an address</DialogTitle>
          <DialogContent>
            At present, we require a site with an address and postcode in order
            to continue. In order to proceed, you will need to submit an
            application through{" "}
            <strong>{settings?.externalPlanningSite?.name}</strong>.
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleModal}>Return to application</Button>
            <a
              href={settings?.externalPlanningSite?.url}
              target="_blank"
              className={classes.externalLink}
            >
              <Button>
                Proceed to {settings?.externalPlanningSite?.name}
                <span style={visuallyHidden}> (opens in a new tab)</span>
              </Button>
            </a>
          </DialogActions>
        </Dialog>
      )}
      <div className={classes.container}>
        <ButtonBase onClick={toggleModal} className={classes.button}>
          <Typography variant="body2">
            The site does not have an address
          </Typography>
        </ButtonBase>
      </div>
    </>
  );
}
