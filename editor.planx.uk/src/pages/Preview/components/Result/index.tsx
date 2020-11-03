import { Box, Button, Typography } from "@material-ui/core";
import React from "react";
import ReactHtmlParser from "react-html-parser";

import Card from "../shared/Card";
import SimpleExpand from "../shared/SimpleExpand";
import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

interface IResult {
  handleSubmit;
  headingColor: {
    text: string;
    background: string;
  };
  headingTitle?: string;
  subheading?: string;
  headingDescription?: string;
  reasonsTitle?: string;
  responses: {
    [key: string]: {
      text: string;
    }[];
  }[];
}

const Result: React.FC<IResult> = ({
  handleSubmit,
  headingColor,
  headingTitle = "",
  subheading = "",
  headingDescription = "",
  reasonsTitle = "",
  responses,
}) => {
  return (
    <Card>
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
          {responses.map((x, i) => {
            const key = Object.keys(x) as any;
            const visibleResponses = x[key].filter((y, j) => j <= 1);
            const hiddenResponses = x[key].filter((y, j) => j > 1);

            return (
              <React.Fragment key={key}>
                <Box mb={1} color="text.secondary">
                  {key}
                </Box>
                {visibleResponses.map((y: any) => {
                  return (
                    <ResultReason key={y.text} id={y.id}>
                      {ReactHtmlParser(y.text)}
                    </ResultReason>
                  );
                })}
                {hiddenResponses.length !== 0 ? (
                  <SimpleExpand
                    buttonText={{
                      open: "See all responses",
                      closed: "See fewer responses",
                    }}
                  >
                    {hiddenResponses.map((y: any) => {
                      return (
                        <ResultReason key={y.text} id={y.id}>
                          {ReactHtmlParser(y.text)}
                        </ResultReason>
                      );
                    })}
                  </SimpleExpand>
                ) : null}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSubmit}
      >
        Continue
      </Button>
      {/* <Box color="text.secondary" pt={2}>
        You will not be able to make further changes
      </Box> */}
    </Card>
  );
};
export default Result;
