import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import type {
  Constraint,
  EnhancedGISResponse,
  GISResponse,
} from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import CardHeader from "@planx/components/shared/Preview/CardHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { GraphError } from "components/Error/GraphError";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import { HandleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";
import useSWR, { Fetcher } from "swr";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";
import { stringify } from "wkt";

import { SiteAddress } from "../FindProperty/model";
import { ErrorSummaryContainer } from "../shared/Preview/ErrorSummaryContainer";
import SimpleExpand from "../shared/Preview/SimpleExpand";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import ConstraintsList from "./List";
import {
  DEFAULT_PLANNING_CONDITIONS_DISCLAIMER,
  type IntersectingConstraints,
  type PlanningConstraints,
} from "./model";
import { handleOverrides } from "./utils";

type Props = PublicProps<PlanningConstraints>;

interface InaccurateConstraint {
  entities: string[];
  reason: string;
}

export type InaccurateConstraints =
  | Record<string, InaccurateConstraint>
  | undefined;

export default Component;

function Component(props: Props) {
  const [
    currentCardId,
    cachedBreadcrumbs,
    teamSlug,
    siteBoundary,
    { x, y, longitude, latitude, usrn },
    hasPlanningData,
    priorOverrides,
  ] = useStore((state) => [
    state.currentCard?.id,
    state.cachedBreadcrumbs,
    state.teamSlug,
    state.computePassport().data?.["property.boundary.site"],
    (state.computePassport().data?.["_address"] as SiteAddress) || {},
    state.teamIntegrations?.hasPlanningData,
    state.computePassport().data?.["_overrides"],
  ]);

  // PlanningConstraints must come after at least a FindProperty in the graph
  const showGraphError = !x || !y || !longitude || !latitude;
  if (showGraphError)
    throw new GraphError("mapInputFieldMustFollowFindProperty");

  // Even though this component will fetch fresh GIS data when coming "back",
  //   still prepopulate any previously marked inaccurateConstraints
  const initialInaccurateConstraints =
    currentCardId &&
    cachedBreadcrumbs?.[currentCardId]?.["data"]?.["_overrides"]?.[props.fn];
  const [inaccurateConstraints, setInaccurateConstraints] =
    useState<InaccurateConstraints>(initialInaccurateConstraints);

  // Get current query parameters (eg ?analytics=false&sessionId=XXX) to determine if we should audit this response
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // Get the coordinates of the site boundary drawing if they exist, fallback on x & y if file was uploaded
  // Coords should match Esri's "rings" type https://developers.arcgis.com/javascript/3/jsapi/polygon-amd.html#rings
  const coordinates: number[][][] = siteBoundary?.geometry?.coordinates || [];

  // Get the WKT representation of the site boundary drawing or address point to pass to Digital Land, when applicable
  const wktPoint = `POINT(${longitude} ${latitude})`;
  const wktPolygon: string | undefined =
    siteBoundary && stringify(siteBoundary);

  const digitalLandParams: Record<string, string> = {
    geom: wktPolygon || wktPoint,
    ...params,
  };
  const customGisParams: Record<string, string> = {
    x: x?.toString(),
    y: y?.toString(),
    siteBoundary: JSON.stringify(coordinates),
    version: "1",
  };

  // Fetch planning constraints data for a given local authority
  const root = `${import.meta.env.VITE_APP_API_URL}/gis/${teamSlug}?`;
  const teamGisEndpoint: string =
    root +
    new URLSearchParams(
      hasPlanningData ? digitalLandParams : customGisParams,
    ).toString();

  const fetcher: Fetcher<GISResponse | GISResponse["constraints"]> = (
    url: string,
  ) => fetch(url).then((r) => r.json());
  const {
    data,
    mutate,
    error: dataError,
    isValidating,
  } = useSWR(
    () => (x && y && latitude && longitude ? teamGisEndpoint : null),
    fetcher,
    { revalidateOnFocus: false },
  );

  // If an OS address was selected, additionally fetch classified roads (available nationally) using the USRN identifier,
  //   skip if the applicant plotted a new non-UPRN address on the map
  const classifiedRoadsEndpoint: string =
    `${import.meta.env.VITE_APP_API_URL}/roads?` +
    new URLSearchParams(usrn ? { usrn } : undefined)?.toString();

  const {
    data: roads,
    error: roadsError,
    isValidating: isValidatingRoads,
  } = useSWR(
    () => (usrn && hasPlanningData ? classifiedRoadsEndpoint : null),
    fetcher,
    { revalidateOnFocus: false },
  );

  // XXX handle both/either Digital Land response and custom GIS hookup responses; merge roads for a unified list of constraints
  const constraints: GISResponse["constraints"] | Record<string, any> = {
    ...(data?.constraints || data),
    ...roads?.constraints,
  };

  const metadata: GISResponse["metadata"] | Record<string, any> = {
    ...data?.metadata,
    ...roads?.metadata,
  };

  const isLoading = isValidating || isValidatingRoads;
  if (isLoading)
    return (
      <Card handleSubmit={props.handleSubmit} isValid>
        <CardHeader title={props.title} description={props.description || ""} />
        <DelayedLoadingIndicator
          text="Fetching data..."
          msDelayBeforeVisible={0}
        />
      </Card>
    );

  return (
    <PlanningConstraintsContent
      title={props.title}
      description={props.description || ""}
      fn={props.fn}
      disclaimer={props.disclaimer}
      constraints={constraints}
      metadata={metadata}
      handleSubmit={() => {
        // `_constraints` & `_overrides` are responsible for auditing
        const _constraints: Array<
          EnhancedGISResponse | GISResponse["constraints"]
        > = [];
        if (hasPlanningData) {
          if (data && !dataError)
            _constraints.push({
              ...data,
              planxRequest: teamGisEndpoint,
            } as EnhancedGISResponse);
          if (roads && !roadsError)
            _constraints.push({
              ...roads,
              planxRequest: classifiedRoadsEndpoint,
            } as EnhancedGISResponse);
        } else {
          if (data) _constraints.push(data as GISResponse["constraints"]);
        }

        const hasInaccurateConstraints =
          inaccurateConstraints &&
          Object.keys(inaccurateConstraints).length > 0;
        const _overrides = hasInaccurateConstraints
          ? { ...priorOverrides, [props.fn]: inaccurateConstraints }
          : undefined;

        // `planningConstraints.action` is for analytics
        const userAction = hasInaccurateConstraints
          ? "Reported at least one inaccurate planning constraint"
          : "Accepted all planning constraints";

        // `[props.fn]` & `_nots[props.fn]` are responsible for future service automations
        const _nots: IntersectingConstraints = {};
        const intersectingConstraints: IntersectingConstraints = {};
        Object.entries(constraints).forEach(([key, data]) => {
          if (data.value) {
            intersectingConstraints[props.fn] ||= [];
            intersectingConstraints[props.fn].push(key);
          } else {
            _nots[props.fn] ||= [];
            _nots[props.fn].push(key);
          }
        });

        // If the user reported inaccurate constraints, ensure they are correctly reflected in `[props.fn]` & `_nots[props.fn]`
        const {
          nots: notsAfterOverrides,
          intersectingConstraints: intersectingConstraintsAfterOverrides,
        } = handleOverrides(
          props.fn,
          constraints,
          inaccurateConstraints,
          intersectingConstraints,
          _nots,
        );

        const passportData = {
          _constraints,
          _overrides,
          "planningConstraints.action": userAction,
          _nots: notsAfterOverrides,
          ...(intersectingConstraintsAfterOverrides[props.fn]?.length === 0
            ? undefined
            : intersectingConstraintsAfterOverrides),
        };

        props.handleSubmit?.({
          data: passportData,
        });
      }}
      refreshConstraints={() => mutate()}
      inaccurateConstraints={inaccurateConstraints}
      setInaccurateConstraints={setInaccurateConstraints}
    />
  );
}

export type PlanningConstraintsContentProps = {
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

export function PlanningConstraintsContent(
  props: PlanningConstraintsContentProps,
) {
  const {
    title,
    description,
    constraints,
    metadata,
    refreshConstraints,
    disclaimer,
    inaccurateConstraints,
    setInaccurateConstraints,
  } = props;
  const error = constraints.error || undefined;
  const showError = error || !Object.values(constraints)?.length;
  if (showError) return <ConstraintsFetchError error={error} {...props} />;

  const positiveConstraints = Object.values(constraints).filter(
    (v: Constraint, _i) => v.text && v.value,
  );
  const negativeConstraints = Object.values(constraints).filter(
    (v: Constraint, _i) => v.text && !v.value,
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
          <Disclaimer text={disclaimer} />
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
          <Typography variant="body1" gutterBottom>
            Continue with your application to tell us more about your project.
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
          <Disclaimer text={disclaimer} />
        </>
      )}
    </Card>
  );
}

const Disclaimer = (props: { text: string }) => (
  <WarningContainer>
    <ErrorOutline />
    <Typography variant="body1" component="div" ml={2} mb={1}>
      <ReactMarkdownOrHtml
        source={props.text || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER}
        openLinksOnNewTab
      />
    </Typography>
  </WarningContainer>
);

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
            again to try again. You can continue your application without this
            information but it might mean we ask additional questions about your
            project.
          </Typography>
          <button onClick={props.refreshConstraints}>Search again</button>
        </>
      )}
    </ErrorSummaryContainer>
  </Card>
);
