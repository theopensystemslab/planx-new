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
}) => {
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  return (
    <Card
      handleSubmit={() => handleSubmit && handleSubmit([])}
      isValid
      fullWidth
    >
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
    </Card>
  );
};
export default Result;
