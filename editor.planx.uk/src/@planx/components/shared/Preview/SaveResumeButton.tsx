import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

import { contentFlowSpacing } from "./Card";

const InnerContainer = styled(Box)(({ theme }) => ({
  "& p": {
    ...contentFlowSpacing(theme),
  },
}));

const SaveResumeButton: React.FC = () => {
  const saveToEmail = useStore((state) => state.saveToEmail);
  const onClick = () =>
    useStore.setState({
      path: Boolean(saveToEmail)
        ? ApplicationPath.Save
        : ApplicationPath.Resume,
    });

  return (
    <InnerContainer>
      <Typography variant="body1">or</Typography>
      <Link component="button" onClick={onClick}>
        <Typography variant="body1" textAlign="left">
          {Boolean(saveToEmail)
            ? "Save and return to this application later"
            : "Resume an application you have already started"}
        </Typography>
      </Link>
    </InnerContainer>
  );
};

export default SaveResumeButton;
