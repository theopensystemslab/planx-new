import Typography from "@mui/material/Typography";
import type { Constraint, GISResponse } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import capitalize from "lodash/capitalize";
import { HandleSubmit } from "pages/Preview/Node";
import React from "react";

import { Disclaimer } from "../../shared/Disclaimer";
import { ErrorSummaryContainer } from "../../shared/Preview/ErrorSummaryContainer";
import SimpleExpand from "../../shared/Preview/SimpleExpand";
import { DEFAULT_PLANNING_CONDITIONS_DISCLAIMER } from "../model";
import { InaccurateConstraints } from ".";
import ConstraintsList from "./List";

export type PresentationalProps = {
  title: string;
  description: string;
  fn: string;
  disclaimer: string;
  constraints: GISResponse["constraints"];
  metadata: GISResponse["metadata"];
  handleSubmit: () => void;
  refreshConstraints: () => void;
  inaccurateConstraints: InaccurateConstraints;
  setInaccurateConstraints: (
    value: React.SetStateAction<InaccurateConstraints>,
  ) => void;
};

export function Presentational(props: PresentationalProps) {
  const {
    title,
    description,
    constraints,
    metadata,
    disclaimer,
    inaccurateConstraints,
    setInaccurateConstraints,
  } = props;

  const error = constraints.error || undefined;
  const showError = error || !Object.values(constraints)?.length;
  if (showError) return <ConstraintsFetchError error={error} {...props} />;

  const positiveConstraints = Object.values(constraints).filter(
    (v: Constraint) => v.text && v.value,
  );
  const negativeConstraints = Object.values(constraints).filter(
    (v: Constraint) => v.text && !v.value,
  );

  return (
    <Card handleSubmit={props.handleSubmit}>
      <CardHeader title={title} description={description} />
      {positiveConstraints.length > 0 && (
        <>
          <Typography variant="h3" component="h2" mt={3}>
            These are the planning constraints we think apply to this property
          </Typography>
          <ConstraintsList
            data={positiveConstraints}
            metadata={metadata}
            inaccurateConstraints={inaccurateConstraints}
            setInaccurateConstraints={setInaccurateConstraints}
          />
          {negativeConstraints.length > 0 && (
            <SimpleExpand
              id="negative-constraints-list"
              data-testid="negative-constraints-list"
              buttonText={{
                open: "Constraints that don't apply to this property",
                closed: "Hide constraints that don't apply",
              }}
            >
              <ConstraintsList
                data={negativeConstraints}
                metadata={metadata}
                inaccurateConstraints={inaccurateConstraints}
                setInaccurateConstraints={setInaccurateConstraints}
              />
            </SimpleExpand>
          )}
          <Disclaimer
            text={disclaimer || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER}
          />
        </>
      )}
      {positiveConstraints.length === 0 && negativeConstraints.length > 0 && (
        <>
          <Typography variant="h3" component="h2" gutterBottom mt={3}>
            It looks like there are no constraints on this property
          </Typography>
          <Typography variant="body1" gutterBottom>
            Based on the information you've given it looks like there are no
            planning constraints on your property that might limit what you can
            do.
          </Typography>
          <SimpleExpand
            id="negative-constraints-list"
            buttonText={{
              open: "Show the things we checked",
              closed: "Hide constraints that don't apply",
            }}
          >
            <ConstraintsList
              data={negativeConstraints}
              metadata={metadata}
              inaccurateConstraints={inaccurateConstraints}
              setInaccurateConstraints={setInaccurateConstraints}
            />
          </SimpleExpand>
          <Disclaimer
            text={disclaimer || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER}
          />
        </>
      )}
    </Card>
  );
}

interface ConstraintsFetchErrorProps {
  error: any;
  title: string;
  description: string;
  refreshConstraints: () => void;
  handleSubmit?: HandleSubmit;
}

const ConstraintsFetchError = (props: ConstraintsFetchErrorProps) => (
  <Card handleSubmit={props.handleSubmit} isValid>
    <CardHeader title={props.title} description={props.description} />
    <ErrorSummaryContainer role="status" data-testid="error-summary-no-info">
      <Typography variant="h4" component="h2" gutterBottom>
        No information available
      </Typography>
      {props.error &&
      typeof props.error === "string" &&
      props.error.endsWith("local authority") ? (
        <Typography variant="body2">{capitalize(props.error)}</Typography>
      ) : (
        <>
          <Typography variant="body2">
            We couldn't find any information about your property. Click search
            again to try again. You can continue without this information but it
            might mean we ask additional questions.
          </Typography>
          <button onClick={props.refreshConstraints}>Search again</button>
        </>
      )}
    </ErrorSummaryContainer>
  </Card>
);
