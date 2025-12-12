import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ApplicationSummary from "ui/public/ApplicationSummary";
import Banner from "ui/public/Banner";
import NumberedList from "ui/public/NumberedList";
import ViewApplicationLink from "ui/public/ViewApplicationLink";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import type { Confirmation } from "./model";

export type Props = PublicProps<Confirmation>;

export default function ConfirmationComponent(props: Props) {
  const isFinalCard = useStore().isFinalCard();
  const theme = useTheme();
  return (
    <Box width="100%">
      <Banner
        heading={props.heading || ""}
        color={{
          background: theme.palette.success.light,
          text: theme.palette.text.primary,
        }}
        Icon={Check}
        iconTitle={"Success"}
      >
        {props.description && (
          <Box mt={2} maxWidth="formWrap">
            <ReactMarkdownOrHtml source={props.description} openLinksOnNewTab />
          </Box>
        )}
      </Banner>
      <Card handleSubmit={isFinalCard ? undefined : props.handleSubmit}>
        <ApplicationSummary/>
        <ViewApplicationLink />
        {props.nextSteps && Boolean(props.nextSteps?.length) && (
          <Box pt={3}>
            <Typography variant="h2" mb={2}>
              What happens next?
            </Typography>
            <NumberedList items={props.nextSteps} heading="h2" />
          </Box>
        )}
        {props.moreInfo && (
          <>
            <Box py={1}>
              <ReactMarkdownOrHtml source={props.moreInfo} />
            </Box>
            <hr />
          </>
        )}
        {props.contactInfo && (
          <Box py={1}>
            <Typography variant="h2" component="h3" gutterBottom>
              Contact us
            </Typography>
            <ReactMarkdownOrHtml source={props.contactInfo} openLinksOnNewTab />
          </Box>
        )}
      </Card>
    </Box>
  );
}
