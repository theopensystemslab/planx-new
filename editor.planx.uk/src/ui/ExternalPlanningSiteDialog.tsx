import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import React from "react";
import { useState } from "react";
import { TeamSettings } from "types";
import { fetchCurrentTeam } from "utils";

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
        content: <>We need an address and postcode to continue.</>,
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
              You can apply for a Lawful Development Certificate without an
              address and postcode through{" "}
              <strong>{settings?.externalPlanningSite?.name}</strong>.
            </p>
          </DialogContent>
          <DialogActions>
            <Link
              component="button"
              onClick={toggleModal}
              sx={{ paddingRight: 2 }}
            >
              <Typography variant="body2">Return to application</Typography>
            </Link>
            <Link href={settings?.externalPlanningSite?.url} target="_blank">
              <Typography variant="body2">
                Go to {settings?.externalPlanningSite?.name}
                <span style={visuallyHidden}> (opens in a new tab)</span>
              </Typography>
            </Link>
          </DialogActions>
        </Dialog>
      )}
      <Box sx={{ textAlign: "right" }}>
        <Link component="button" onClick={toggleModal}>
          <Typography variant="body2">{title}</Typography>
        </Link>
      </Box>
    </>
  );
}
