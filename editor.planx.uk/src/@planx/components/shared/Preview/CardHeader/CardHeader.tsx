import HelpIcon from "@mui/icons-material/Help";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import React from "react";
import { emptyContent } from "ui/editor/RichTextInput";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import { DESCRIPTION_TEXT } from "../../constants";
import MoreInfo from "../MoreInfo";
import MoreInfoSection from "../MoreInfoSection";
import {
  CardHeaderWrapper,
  Description,
  HelpButton,
  Image,
  TitleWrapper,
} from "./styled";
import { ICardHeader } from "./types";

const CardHeader: React.FC<ICardHeader> = ({
  title,
  description,
  info,
  policyRef,
  howMeasured,
  definitionImg,
  img,
}) => {
  const [open, setOpen] = React.useState(false);
  const { trackEvent } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackEvent({ event: "helpClick", metadata: {} }); // This returns a promise but we don't need to await for it
  };

  return (
    <CardHeaderWrapper>
      {title && (
        <TitleWrapper mr={1} pt={0.5}>
          <Typography
            variant="h2"
            role="heading"
            aria-level={1}
            component="h1"
            sx={{ textWrap: "balance" }}
          >
            {title}
          </Typography>
        </TitleWrapper>
      )}
      {description && (
        <Description>
          <Typography variant="subtitle1" component="div">
            <ReactMarkdownOrHtml
              source={description}
              id={DESCRIPTION_TEXT}
              openLinksOnNewTab
            />
          </Typography>
        </Description>
      )}
      {!!(info || policyRef || howMeasured) && (
        <Typography variant="subtitle1" component="div">
          <HelpButton
            variant="help"
            title={`More information`}
            aria-label={`See more information about "${title}"`}
            onClick={handleHelpClick}
            aria-haspopup="dialog"
            data-testid="more-info-button"
          >
            <HelpIcon /> More information
          </HelpButton>
        </Typography>
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
      {img && <Image src={img} alt="question" />}
    </CardHeaderWrapper>
  );
};
export default CardHeader;
