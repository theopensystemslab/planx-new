import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import type { Constraint, GISResponse } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";
import useSWR from "swr";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { stringify } from "wkt";

import { ErrorSummaryContainer } from "../shared/Preview/ErrorSummaryContainer";
import SimpleExpand from "../shared/Preview/SimpleExpand";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import ConstraintsList from "./List";
import type { PlanningConstraints } from "./model";

type Props = PublicProps<PlanningConstraints>;

export default Component;

function Component(props: Props) {
  const siteBoundary = useStore(
    (state) => state.computePassport().data?.["property.boundary.site"]
  );
  const { x, y, longitude, latitude, usrn } =
    useStore((state) => state.computePassport().data?._address) || {};
  const showGraphError: boolean = !x && !y && !longitude && !latitude;

  const teamSlug = useStore((state) => state.teamSlug);

  // Get current query parameters (eg ?analytics=false&sessionId=XXX) to determine if we should audit this response
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // Get the coordinates of the site boundary drawing if they exist, fallback on x & y if file was uploaded
  // Coords should match Esri's "rings" type https://developers.arcgis.com/javascript/3/jsapi/polygon-amd.html#rings
  const coordinates: number[][][] = siteBoundary?.geometry?.coordinates || [];

  // Get the WKT representation of the site boundary drawing or address point to pass to Digital Land, when applicable
  const wktPoint: string = `POINT(${longitude} ${latitude})`;
  const wktPolygon: string | undefined =
    siteBoundary && stringify(siteBoundary);

  // Configure which planx teams should query Digital Land (or continue to use custom GIS) and set URL params accordingly
  //   In future, Digital Land will theoretically support any UK address and this list won't be necessary, but data collection still limited to select councils!
  const digitalLandOrganisations: string[] = [
    "opensystemslab",
    "buckinghamshire",
    "canterbury",
    "camden",
    "doncaster",
    "gloucester",
    "lambeth",
    "medway",
    "newcastle",
    "southwark",
  ];

  const digitalLandParams: Record<string, string> = {
    geom: wktPolygon || wktPoint,
    ...params,
  };
  const customGisParams: Record<string, any> = {
    x: x,
    y: y,
    siteBoundary: JSON.stringify(coordinates),
    version: 1,
  };

  // Fetch planning constraints data for a given local authority
  const root: string = `${process.env.REACT_APP_API_URL}/gis/${teamSlug}?`;
  const teamGisEndpoint: string =
    root +
    new URLSearchParams(
      digitalLandOrganisations.includes(teamSlug)
        ? digitalLandParams
        : customGisParams
    ).toString();

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate, isValidating } = useSWR(
    () => (x && y && latitude && longitude ? teamGisEndpoint : null),
    fetcher,
    { revalidateOnFocus: false }
  );

  // If an OS address was selected, additionally fetch classified roads (available nationally) using the USRN identifier,
  //   skip if the applicant plotted a new non-UPRN address on the map
  const classifiedRoadsEndpoint: string = `${process.env.REACT_APP_API_URL}/roads`;
  const { data: roads, isValidating: isValidatingRoads } = useSWR(
    () =>
      usrn && digitalLandOrganisations.includes(teamSlug)
        ? classifiedRoadsEndpoint + `?usrn=${usrn}`
        : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // XXX handle both/either Digital Land response and custom GIS hookup responses; merge roads for a unified list of constraints
  const constraints: GISResponse["constraints"] = {
    ...(data?.constraints || data),
    ...roads?.constraints,
  };

  const metadata: GISResponse["metadata"] = {
    ...data?.metadata,
    ...roads?.metadata,
  };

  return (
    <>
      {showGraphError ? (
        <ConstraintsGraphError {...props} />
      ) : !isValidating && !isValidatingRoads && constraints ? (
        <PlanningConstraintsContent
          title={props.title}
          description={props.description || ""}
          fn={props.fn}
          constraints={constraints}
          metadata={metadata}
          previousFeedback={props.previouslySubmittedData?.feedback}
          handleSubmit={(values: { feedback?: string }) => {
            const _nots: any = {};
            const newPassportData: any = {};

            Object.entries(constraints).forEach(([key, data]: any) => {
              if (data.value) {
                newPassportData[props.fn] ||= [];
                newPassportData[props.fn].push(key);
              } else {
                _nots[props.fn] ||= [];
                _nots[props.fn].push(key);
              }
            });

            const passportData = {
              _nots,
              ...newPassportData,
              ...{ digitalLandRequest: data?.url || "" },
            };

            props.handleSubmit?.({
              ...values,
              data: passportData,
            });
          }}
          refreshConstraints={() => mutate()}
        />
      ) : (
        <Card handleSubmit={props.handleSubmit} isValid>
          <QuestionHeader
            title={props.title}
            description={props.description || ""}
          />
          <DelayedLoadingIndicator text="Fetching data..." />
        </Card>
      )}
    </>
  );
}

type PlanningConstraintsContentProps = {
  title: string;
  description: string;
  fn: string;
  constraints: GISResponse["constraints"];
  metadata: GISResponse["metadata"];
  handleSubmit: (values: { feedback: string }) => void;
  refreshConstraints: () => void;
  previousFeedback?: string;
};

export function PlanningConstraintsContent(
  props: PlanningConstraintsContentProps
) {
  const {
    title,
    description,
    constraints,
    metadata,
    handleSubmit,
    refreshConstraints,
    previousFeedback,
  } = props;
  const formik = useFormik({
    initialValues: {
      feedback: previousFeedback || "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(
          values.feedback,
          "Inaccurate planning constraints",
          constraints
        );
      }
      handleSubmit?.(values);
    },
  });
  const error = constraints.error || undefined;
  const showError = error || !Object.values(constraints)?.length;

  const positiveConstraints = Object.values(constraints).filter(
    (v: Constraint, _i) => v.text && v.value
  );

  const negativeConstraints = Object.values(constraints).filter(
    (v: Constraint, _i) => v.text && !v.value
  );

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      {showError && (
        <ConstraintsFetchError
          error={error}
          refreshConstraints={refreshConstraints}
        />
      )}
      {positiveConstraints.length > 0 && (
        <>
          <Typography variant="h4" component="h2" gutterBottom>
            These are the planning constraints we think apply to this property
          </Typography>
          <ConstraintsList data={positiveConstraints} metadata={metadata} />
          {negativeConstraints.length > 0 && (
            <SimpleExpand
              buttonText={{
                open: "Constraints that don't apply to this property",
                closed: "Hide constraints that don't apply",
              }}
            >
              <ConstraintsList data={negativeConstraints} metadata={metadata} />
            </SimpleExpand>
          )}
          <PlanningConditionsInfo />
        </>
      )}
      {positiveConstraints.length === 0 && negativeConstraints.length > 0 && (
        <>
          <Typography variant="h4" component="h2">
            It looks like there are no constraints on this property
          </Typography>
          <Typography variant="body2">
            Based on the information you've given it looks like there are no
            planning constraints on your property that might limit what you can
            do.
          </Typography>
          <Typography variant="body2">
            Continue with your application to tell us more about your project.
          </Typography>
          <SimpleExpand
            buttonText={{
              open: "Show the things we checked",
              closed: "Hide constraints that don't apply",
            }}
          >
            <ConstraintsList data={negativeConstraints} metadata={metadata} />
          </SimpleExpand>
          <PlanningConditionsInfo />
        </>
      )}
    </Card>
  );
}

const PlanningConditionsInfo = () => (
  <WarningContainer>
    <ErrorOutline />
    <Typography variant="body1" ml={2} fontWeight={FONT_WEIGHT_SEMI_BOLD}>
      This page does not include information about historic planning conditions
      that may apply to this property.
    </Typography>
  </WarningContainer>
);

interface ConstraintsFetchErrorProps {
  error: any;
  refreshConstraints: () => void;
}

const ConstraintsFetchError = (props: ConstraintsFetchErrorProps) => (
  <ErrorSummaryContainer role="status" data-testid="error-summary-no-info">
    <Typography variant="h5" component="h2" gutterBottom>
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
          again to try again. You can continue your application without this
          information but it might mean we ask additional questions about your
          project.
        </Typography>
        <button onClick={props.refreshConstraints}>Search again</button>
      </>
    )}
  </ErrorSummaryContainer>
);

interface ConstraintsGraphErrorProps {
  title: string;
  description: string;
  handleSubmit?: handleSubmit;
}

const ConstraintsGraphError = (props: ConstraintsGraphErrorProps) => (
  <Card handleSubmit={props.handleSubmit} isValid>
    <QuestionHeader title={props.title} description={props.description || ""} />
    <ErrorSummaryContainer
      role="status"
      data-testid="error-summary-invalid-graph"
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Invalid graph
      </Typography>
      <Typography variant="body2">
        Edit this flow so that "Planning constraints" is positioned after "Find
        property"; an address or site boundary drawing is required to fetch
        data.
      </Typography>
    </ErrorSummaryContainer>
  </Card>
);
