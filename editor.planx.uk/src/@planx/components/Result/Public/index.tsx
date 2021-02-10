import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Warning from "@material-ui/icons/WarningOutlined";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { handleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";

import type { TextContent } from "../../../../types";
import type { Node } from "./model";
import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

export interface Props {
  handleSubmit: handleSubmit;
  headingColor: {
    text: string;
    background: string;
  };
  headingTitle?: string;
  subheading?: string;
  headingDescription?: string;
  reasonsTitle?: string;
  responses: Array<{
    question: Node;
    selections?: Array<Node>;
    hidden: boolean;
  }>;
  disclaimer?: TextContent;
}

const useClasses = makeStyles((theme) => ({
  disclaimer: {
    cursor: "pointer",
  },
  readMore: {
    marginLeft: theme.spacing(1),
    color: theme.palette.grey[500],
    "&:hover": {
      color: theme.palette.grey[400],
    },
  },
  disclaimerContent: {
    marginTop: theme.spacing(1),
  },
}));

const Responses = ({ responses }: any) => (
  <>
    {responses.map(({ question, selections }: any) => (
      <ResultReason
        key={question.id}
        id={question.id}
        question={question}
        response={selections.map((s: any) => s.data.text).join(",")}
      />
    ))}
  </>
);

const Result: React.FC<Props> = ({
  handleSubmit,
  headingColor,
  headingTitle = "",
  subheading = "",
  headingDescription = "",
  reasonsTitle = "",
  responses,
  disclaimer,
}) => {
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  // TODO: Disclaimer should come from flow settings
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const classes = useClasses();
  const theme = useTheme();

  return (
    <Card handleSubmit={handleSubmit} isValid fullWidth>
      <ResultSummary
        subheading={subheading}
        color={headingColor}
        heading={headingTitle}
      />
      <Box mb={2} mt={0} px={{ xs: 2, md: 5 }}>
        <Typography variant="body2">{headingDescription}</Typography>
        <Box mt={4}>
          <Typography variant="h3" gutterBottom>
            {reasonsTitle}
          </Typography>
        </Box>
        <Box mb={3}>
          <Box mb={1} color="secondary.dark">
            Planning Permission
          </Box>

          <Responses responses={visibleResponses} />

          {hiddenResponses.length > 0 && (
            <SimpleExpand
              buttonText={{
                open: "See all responses",
                closed: "See fewer responses",
              }}
            >
              <Responses responses={hiddenResponses} />
            </SimpleExpand>
          )}
        </Box>
        {disclaimer?.show && (
          <Box
            bgcolor="background.paper"
            p={1.25}
            display="flex"
            color={theme.palette.grey[600]}
            className={classes.disclaimer}
          >
            <Warning />
            <Box ml={1}>
              <Box
                display="flex"
                alignItems="center"
                onClick={() => setShowDisclaimer(!showDisclaimer)}
              >
                <Typography variant="h6" color="inherit">
                  {disclaimer.heading}
                </Typography>
                <Typography variant="body2" className={classes.readMore}>
                  read {showDisclaimer ? "less" : "more"}
                </Typography>
              </Box>
              <Collapse in={showDisclaimer}>
                <Typography
                  variant="body2"
                  color="inherit"
                  className={classes.disclaimerContent}
                >
                  {disclaimer.content}
                </Typography>
              </Collapse>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};
export default Result;
