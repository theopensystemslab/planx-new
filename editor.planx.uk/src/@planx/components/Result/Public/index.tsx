import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

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
}

const Responses = ({ responses }: any) => (
  <>
    {responses.map(({ question, selections }: any) => (
      <ResultReason
        key={question.id}
        id={question.id}
        question={question}
        response={selections.map((s: any) => s.data.text).join(",")}
      >
        {question.data.info && (
          <Box>
            <Typography variant="body2">Why it matters text</Typography>
          </Box>
        )}
      </ResultReason>
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
}) => {
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  return (
    <Card handleSubmit={handleSubmit} isValid>
      <ResultSummary
        subheading={subheading}
        color={headingColor}
        heading={headingTitle}
      >
        {headingDescription}
      </ResultSummary>
      <Box mb={2}>
        <Typography variant="h3" gutterBottom>
          {reasonsTitle}
        </Typography>
        <Box mb={3}>
          {/* TODO: Figure out the theme colors */}
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
      </Box>
      {/* <Box color="text.secondary" pt={2}>
        You will not be able to make further changes
      </Box> */}
    </Card>
  );
};
export default Result;
