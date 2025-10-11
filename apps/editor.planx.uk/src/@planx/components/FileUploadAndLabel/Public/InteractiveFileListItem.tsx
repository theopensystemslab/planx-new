import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { MoreInformation } from "@planx/components/shared";
import { StatusIcon } from "@planx/components/shared/Icons/StatusIcon";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { HelpClickMetadata } from "pages/FlowEditor/lib/analytics/types";
import React, { useState } from "react";
import { emptyContent } from "ui/editor/RichTextInput/utils";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { Image } from "../../shared/Preview/CardHeader/styled";
import MoreInfo from "../../shared/Preview/MoreInfo";
import MoreInfoSection from "../../shared/Preview/MoreInfoSection";

export const InfoButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  marginLeft: theme.spacing(1.5),
  boxShadow: "none",
  minHeight: "44px",
})) as typeof Button;

interface FileListItemProps {
  name: string;
  fn: string;
  completed: boolean;
  moreInformation?: MoreInformation;
}

export const InteractiveFileListItem = (props: FileListItemProps) => {
  const [open, setOpen] = useState(false);
  const { trackEvent } = useAnalyticsTracking();
  const { info, policyRef, howMeasured, definitionImg } =
    props.moreInformation || {};

  const handleHelpClick = (metadata: HelpClickMetadata) => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata }); // This returns a promise but we don't need to await for it
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        borderBottom: (theme) => `1px solid ${theme.palette.border.main}`,
        minHeight: "50px",
        padding: (theme) => theme.spacing(0.5, 0),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", mr: 0.65 }}>
          <StatusIcon
            isCompleted={props.completed}
            title={{
              complete: `${props.name} has been uploaded`,
              incomplete: `${props.name} has not been uploaded`,
            }}
          />
        </Box>
        <Typography component="span" variant="body1">
          {props.name}
        </Typography>
      </Box>
      {!!(info || policyRef || howMeasured) && (
        <InfoButton
          variant="help"
          title={`More information`}
          aria-label={`See more information about "${props.name}"`}
          onClick={() => handleHelpClick({ [props.fn]: props.name })}
          aria-haspopup="dialog"
          size="small"
        >
          <span>Info</span>
        </InfoButton>
      )}
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && info !== emptyContent ? (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdownOrHtml source={info} openLinksOnNewTab />
          </MoreInfoSection>
        ) : undefined}
        {policyRef && policyRef !== emptyContent ? (
          <MoreInfoSection title="Source">
            <ReactMarkdownOrHtml source={policyRef} openLinksOnNewTab />
          </MoreInfoSection>
        ) : undefined}
        {howMeasured && howMeasured !== emptyContent ? (
          <MoreInfoSection title="How is it defined?">
            <>
              {definitionImg && (
                <Image
                  src={definitionImg}
                  alt=""
                  aria-describedby="howMeasured"
                />
              )}
              <ReactMarkdownOrHtml
                source={howMeasured}
                openLinksOnNewTab
                id="howMeasured"
              />
            </>
          </MoreInfoSection>
        ) : undefined}
      </MoreInfo>
    </Box>
  );
};
