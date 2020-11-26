import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";

import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

interface Node {
  id: string;
  data: {
    text: string;
    flag?: string;
  };
}

interface Props {
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

const Responses = ({ responses }) => (
  <>
    {responses.map(({ question, selections }) => (
      <ResultReason key={question.id} id={question.id}>
        {question.data.text}{" "}
        <strong>{selections.map((s) => s.data.text).join(",")}</strong>
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
    <Card handleSubmit={handleSubmit}>
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
          <Box mb={1} color="text.secondary">
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
