import type { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import NextStepsList from "ui/public/NextStepsList";

import Card from "../shared/Preview/Card";
import { CardHeader } from "../shared/Preview/CardHeader/CardHeader";
import { isRuleMet } from "../shared/RuleBuilder/utils";
import type { NextSteps } from "./model";

export type Props = PublicProps<NextSteps>;

const NextStepsComponent: React.FC<Props> = (props) => {
  const passport = useStore((state) => state.computePassport());

  const steps = props.hasStepRules
    ? props.steps.filter((step) => !step.rule || isRuleMet(passport, step.rule))
    : props.steps;

  // Skip component if no steps to show user
  if (!steps.length) {
    props.handleSubmit?.({ auto: true });
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <NextStepsList steps={steps} handleSubmit={props.handleSubmit} />
    </Card>
  );
};

export default NextStepsComponent;
