import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";

import { ResponsiveQuestion } from "../model";

type Props = PublicProps<ResponsiveQuestion>;

function ResponsiveQuestionComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <CardHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}
