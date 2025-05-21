import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";

import { ResponsiveChecklist } from "../model";

type Props = PublicProps<ResponsiveChecklist>;

function ResponsiveChecklistComponent(props: Props) {
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
