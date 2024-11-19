import Typography from "@mui/material/Typography";
import type {
  EnhancedGISResponse,
  GISResponse,
} from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { GraphError } from "components/Error/GraphError";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import useSWR, { Fetcher } from "swr";
import { stringify } from "wkt";

import { SiteAddress } from "../FindProperty/model";
import { ErrorSummaryContainer } from "../shared/Preview/ErrorSummaryContainer";
import {
  type IntersectingConstraints,
  type PlanningConstraints,
} from "./model";
import { Presentational } from "./Presentational";
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

  const handleSubmit = () => {
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
      inaccurateConstraints && Object.keys(inaccurateConstraints).length > 0;
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
  };

  if (teamSlug === "demo") {
    return (
      <Card handleSubmit={props.handleSubmit}>
        <CardHeader title={props.title} />
        <ErrorSummaryContainer role="status">
          <Typography variant="h4" ml={2} mb={1}>
            Planning Constraints are not enabled for demo users
          </Typography>
          <Typography variant="body2" ml={2}>
            Since we cannot automatically check constraints, you might be asked
            additional questions about your project.
          </Typography>
          <Typography variant="body2" ml={2} mt={0.5}>
            Click continue to proceed with your application.
          </Typography>
        </ErrorSummaryContainer>
      </Card>
    );
  }

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
    <Presentational
      title={props.title}
      description={props.description || ""}
      fn={props.fn}
      disclaimer={props.disclaimer}
      constraints={constraints}
      metadata={metadata}
      handleSubmit={handleSubmit}
      refreshConstraints={() => mutate()}
      inaccurateConstraints={inaccurateConstraints}
      setInaccurateConstraints={setInaccurateConstraints}
    />
  );
}
