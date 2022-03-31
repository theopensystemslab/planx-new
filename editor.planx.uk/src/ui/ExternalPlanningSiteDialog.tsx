import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";
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

export enum DialogPurpose {
  MissingProjectType,
  MissingAddress,
}

const getTitleAndContent = (
  purpose: DialogPurpose,
  settings?: TeamSettings
): Record<string, string | JSX.Element> => {
  switch (purpose) {
    case DialogPurpose.MissingAddress:
      return {
        title: "The site does not have an address",
        content: (
          <>
            <p>We need an address and postcode to continue.</p>
            <p>
              You can apply for a Lawful Development Certificate without an
              address and postcode through Planning Portal.
            </p>
          </>
        ),
      };
    case DialogPurpose.MissingProjectType:
      return {
        title: "My project type is not listed",
        content: (
          <>
            <p>At present, only the listed project types are supported.</p>
            {settings?.supportEmail && (
              <p>
                Please feel free to{" "}
                <Link
                  underline="always"
                  href={`mailto:${
                    settings?.supportEmail
                  }?subject=${encodeURIComponent(
                    "Planning Application - Suggestion for Project Type"
                  )}`}
                >
                  contact us via email
                </Link>{" "}
                if you would like your project type to be added.
              </p>
            )}
          </>
        ),
      };
  }
};

interface Props {
  purpose: DialogPurpose;
  teamSettings?: TeamSettings;
}

export default function ExternalPlanningSiteDialog({
  purpose,
  teamSettings,
}: Props): FCReturn {
  const classes = useClasses();
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const settings = teamSettings || fetchCurrentTeam()?.settings;
  const { title, content } = getTitleAndContent(purpose, settings);
  return (
    <>
      {isOpen && (
        <Dialog open onClose={toggleModal}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            {content}
            <p>
              In order to proceed, you will need to submit an application
              through <strong>{settings?.externalPlanningSite?.name}</strong>.
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleModal}>Return to application</Button>
            <Link
              href={settings?.externalPlanningSite?.url}
              target="_blank"
              className={classes.externalLink}
            >
              <Button>
                Go to {settings?.externalPlanningSite?.name}
                <span style={visuallyHidden}> (opens in a new tab)</span>
              </Button>
            </Link>
          </DialogActions>
        </Dialog>
      )}
      <div className={classes.container}>
        <ButtonBase onClick={toggleModal} className={classes.button}>
          <Typography variant="body2">{title}</Typography>
        </ButtonBase>
      </div>
    </>
  );
}
