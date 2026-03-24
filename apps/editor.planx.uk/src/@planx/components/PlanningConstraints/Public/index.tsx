import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
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

import { SiteAddress } from "../../FindProperty/model";
import { ErrorSummaryContainer } from "../../shared/Preview/ErrorSummaryContainer";
import {
  getAvailableDatasets,
  type IntersectingConstraints,
  type PlanningConstraints,
} from "../model";
import { useClassifiedRoads } from "./hooks/useClassifiedRoads";
import { useTeamGISData } from "./hooks/useTeamGISData";
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
    hasPlanningData,
    priorOverrides,
    { longitude, latitude },
  ] = useStore((state) => [
    state.currentCard?.id,
    state.cachedBreadcrumbs,
    state.teamSlug,
    state.teamIntegrations?.hasPlanningData,
    state.computePassport().data?.["_overrides"],
    (state.computePassport().data?.["_address"] as SiteAddress) || {},
  ]);

  // Existing components will not have dataValues prop so should default to all available datasets
  const dataValues =
    props.dataValues || getAvailableDatasets(teamSlug).map((d) => d.val);

  // PlanningConstraints must come after at least a FindProperty in the graph
  const showGraphError = !longitude || !latitude;
  if (showGraphError) throw new GraphError("nodeMustFollowFindProperty");

  // Even though this component will fetch fresh GIS data when coming "back",
  //   still prepopulate any previously marked inaccurateConstraints
  const initialInaccurateConstraints =
    currentCardId &&
    cachedBreadcrumbs?.[currentCardId]?.["data"]?.["_overrides"]?.[props.fn];
  const [inaccurateConstraints, setInaccurateConstraints] =
    useState<InaccurateConstraints>(initialInaccurateConstraints);

  const {
    data,
    refetch: refreshConstraints,
    isError: isGISError,
    isPending: isPendingGIS,
    isFetching: isFetchingGIS,
  } = useTeamGISData(dataValues);

  const {
    data: roads,
    isError: isRoadsError,
    isPending: isPendingRoads,
    isFetching: isFetchingRoads,
  } = useClassifiedRoads(dataValues);

  // Merge Planning Data and Roads responses for a unified list of constraints
  const constraints: GISResponse["constraints"] = {
    ...data?.constraints,
    ...roads?.constraints,
  };
  const metadata: GISResponse["metadata"] = {
    ...data?.metadata,
    ...roads?.metadata,
  };

  const handleSubmit = () => {
    // `_constraints` & `_overrides` are responsible for auditing
    const _constraints: Array<EnhancedGISResponse> = [];
    if (hasPlanningData) {
      if (data && !isGISError) _constraints.push(data);
      if (roads && !isRoadsError) _constraints.push(roads);
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
            additional questions.
          </Typography>
          <Typography variant="body2" ml={2} mt={0.5}>
            Click continue to proceed with your form.
          </Typography>
        </ErrorSummaryContainer>
      </Card>
    );
  }

  const isLoading =
    (isPendingGIS && isFetchingGIS) || (isPendingRoads && isFetchingRoads);

  if (isLoading)
    return (
      <Card handleSubmit={props.handleSubmit} isValid={false}>
        <CardHeader title={props.title} description={props.description || ""} />
        <DelayedLoadingIndicator
          variant="ellipses"
          text="Checking for planning constraints that may apply to this property"
          msDelayBeforeVisible={0}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
              "& > span": {
                maxWidth: "100%",
              },
            }}
          >
            <Skeleton
              variant="rectangular"
              width={900}
              height={60}
              aria-hidden="true"
            />
            <Skeleton
              variant="rectangular"
              width={900}
              height={60}
              aria-hidden="true"
            />
          </Box>
        </DelayedLoadingIndicator>
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
      refreshConstraints={refreshConstraints}
      inaccurateConstraints={inaccurateConstraints}
      setInaccurateConstraints={setInaccurateConstraints}
    />
  );
}
