import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

const SaveResumeButton: React.FC = () => {
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
      <Link component="button" onClick={onClick}>
        <Typography variant="body2">
          {Boolean(saveToEmail)
            ? "Save and return to this application later"
            : "Resume an application you have already started"}
        </Typography>
      </Link>
    </>
  );
};

export default SaveResumeButton;
