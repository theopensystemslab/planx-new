import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import useSWR from "swr";
import CollapsibleInput from "ui/CollapsibleInput";
import { stringify } from "wkt";

import ConstraintsList, { ErrorSummaryContainer } from "./List";
import type { PlanningConstraints } from "./model";

type Props = PublicProps<PlanningConstraints>;

export default Component;

function Component(props: Props) {
  const siteBoundary = useStore(
    (state) => state.computePassport().data?.["property.boundary.site"]
  );
  const { x, y, longitude, latitude, usrn } =
    useStore((state) => state.computePassport().data?._address) || {};

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
    "doncaster",
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
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  // If an OS address was selected, additionally fetch classified roads (available nationally) using the USRN identifier,
  //   skip if the applicant plotted a new non-UPRN address on the map
  const classifiedRoadsEndpoint: string = `${process.env.REACT_APP_API_URL}/roads`;
  const { data: roads, isValidating: isValidatingRoads } = useSWR(
    () => (usrn ? classifiedRoadsEndpoint + `?usrn=${usrn}` : null),
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  // XXX handle both/either Digital Land response and custom GIS hookup responses; merge roads for a unified list of constraints
  const constraints: Record<string, any> | undefined = {
    ...(data?.constraints || data),
    ...roads,
  };

  const metadata: Record<string, any> | undefined = data?.metadata;

  return (
    <>
      {!isValidating && !isValidatingRoads && constraints ? (
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
          sourcedFromDigitalLand={digitalLandOrganisations.includes(teamSlug)}
        />
      ) : (
        <Card handleSubmit={props.handleSubmit} isValid>
          <QuestionHeader
            title={props.title}
            description={props.description || ""}
          />
          {x && y && longitude && latitude ? (
            <DelayedLoadingIndicator text="Fetching data..." />
          ) : (
            <ErrorSummaryContainer
              role="status"
              data-testid="error-summary-invalid-graph"
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Invalid graph
              </Typography>
              <Typography variant="body2">
                Edit this flow so that "Planning constraints" is positioned
                after "Find property"; an address or site boundary drawing is
                required to fetch data.
              </Typography>
            </ErrorSummaryContainer>
          )}
        </Card>
      )}
    </>
  );
}

export function PlanningConstraintsContent(props: any) {
  const {
    title,
    description,
    constraints,
    metadata,
    handleSubmit,
    refreshConstraints,
    sourcedFromDigitalLand,
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

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <ConstraintsList
        data={constraints}
        metadata={metadata}
        refreshConstraints={refreshConstraints}
      />
      {sourcedFromDigitalLand && (
        <Box sx={{ pb: "1em" }}>
          <Typography variant="body2" color="inherit">
            Sourced from Department for Levelling Up, Housing & Communities.
          </Typography>
        </Box>
      )}
      <Box color="text.secondary" textAlign="right">
        <CollapsibleInput
          name="feedback"
          handleChange={formik.handleChange}
          value={formik.values.feedback}
        >
          <Typography variant="body2" color="inherit">
            Report an inaccuracy
          </Typography>
        </CollapsibleInput>
      </Box>
    </Card>
  );
}
