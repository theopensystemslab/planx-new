import Button from "@material-ui/core/Button";
import { Content } from "@planx/components/Content/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import React from "react";

export type Props = PublicProps<Content>;

const ContentComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <QuestionHeader
        description={props.content}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        onClick={() => props.handleSubmit()}
      >
        Continue
      </Button>
    </Card>
  );
};

export default ContentComponent;
