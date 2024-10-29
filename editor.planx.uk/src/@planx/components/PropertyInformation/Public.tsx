import { useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import type { PublicProps } from "@planx/components/shared/types";
import { GraphError } from "components/Error/GraphError";
import { Feature } from "geojson";
import { publicClient } from "lib/graphql";
import find from "lodash/find";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import { HandleSubmit } from "pages/Preview/Node";
import React from "react";

import type { SiteAddress } from "../FindProperty/model";
import { FETCH_BLPU_CODES } from "../FindProperty/Public";
import { MapContainer } from "../shared/Preview/MapContainer";
import type { PropertyInformation } from "./model";

export default Component;

function Component(props: PublicProps<PropertyInformation>) {
  const [passport, overrideAnswer] = useStore((state) => [
    state.computePassport(),
    state.overrideAnswer,
  ]);
  const { data: blpuCodes } = useQuery(FETCH_BLPU_CODES, {
    client: publicClient,
  });

  if (!passport.data?._address)
    throw new GraphError("nodeMustFollowFindProperty");

  return (
    <Presentational
      title={props.title}
      description={props.description}
      showPropertyTypeOverride={props.showPropertyTypeOverride}
      address={passport.data?._address}
      propertyType={passport.data?.["property.type"]}
      localAuthorityDistrict={
        passport.data?.["property.localAuthorityDistrict"]
      }
      titleBoundary={passport.data?.["property.boundary.title"]}
      blpuCodes={blpuCodes}
      overrideAnswer={overrideAnswer}
      handleSubmit={() => {
        // If the user changed their property type, they'll already have a previous PropertyInformation breadcrumb that set `_overrides`
        const hasOverrodeAnswer =
          passport.data?.["_overrides"]?.["property.type"];
        const passportData = {
          "propertyInformation.action": hasOverrodeAnswer
            ? "Changed the property type"
            : "Accepted the property type",
        };

        props.handleSubmit?.({
          data: passportData,
        });
      }}
    />
  );
}

// Exported for tests
export interface PresentationalProps {
  title: string;
  description: string;
  showPropertyTypeOverride?: boolean;
  address?: SiteAddress;
  propertyType?: string[];
  localAuthorityDistrict?: string[];
  titleBoundary?: Feature;
  blpuCodes?: any;
  overrideAnswer: (fn: string) => void;
  handleSubmit?: HandleSubmit;
}

// Export this component for testing visual presentation with mocked props
export function Presentational(props: PresentationalProps) {
  const {
    title,
    description,
    showPropertyTypeOverride,
    address,
    propertyType,
    localAuthorityDistrict,
    titleBoundary,
    blpuCodes,
    overrideAnswer,
    handleSubmit,
  } = props;
  const [teamName, environment] = useStore((state) => [
    state.teamName,
    state.previewEnvironment,
  ]);

  const propertyDetails: PropertyDetail[] = [
    {
      heading: "Address",
      detail: address?.title,
    },
    {
      heading: "Postcode",
      detail: address?.postcode,
    },
    {
      heading: "Local planning authority",
      detail: localAuthorityDistrict?.join(", ") || teamName,
    },
    {
      heading: "Property type",
      detail:
        find(blpuCodes?.blpu_codes, { value: propertyType?.[0] })
          ?.description ||
        propertyType?.[0] ||
        "Unknown",
      fn: "property.type",
    },
  ];

  return (
    <Card handleSubmit={handleSubmit}>
      <CardHeader title={title} description={description} />
      <MapContainer environment={environment}>
        <p style={visuallyHidden}>
          A static map centred on the property address, showing the title
          boundary, often called the "blue-line" boundary in planning, of your
          site. This boundary is sourced from the Land Registry and displayed
          atop an Ordnance Survey basemap.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="property-information-map"
          ariaLabelOlFixedOverlay="A static map of the property address"
          zoom={19.5}
          latitude={address?.latitude}
          longitude={address?.longitude}
          osProxyEndpoint={`${
            import.meta.env.VITE_APP_API_URL
          }/proxy/ordnance-survey`}
          hideResetControl
          staticMode
          showCentreMarker
          markerLatitude={address?.latitude}
          markerLongitude={address?.longitude}
          // markerColor={team?.settings?.design?.color} // defaults to black
          geojsonData={JSON.stringify(titleBoundary)}
          geojsonColor="#0010A4"
          geojsonBuffer={30}
          osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
          geojsonDataCopyright={`<a href="https://www.planning.data.gov.uk/dataset/title-boundary" target="_blank" style="color:#0010A4;">Title boundary</a> subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100026316`}
          collapseAttributions={window.innerWidth < 500 ? true : undefined}
        />
      </MapContainer>
      {propertyDetails && (
        <PropertyDetails
          data={propertyDetails}
          showPropertyTypeOverride={showPropertyTypeOverride}
          overrideAnswer={overrideAnswer}
        />
      )}
    </Card>
  );
}

interface PropertyDetail {
  heading: string;
  detail: any;
  fn?: string;
}

interface PropertyDetailsProps {
  data: PropertyDetail[];
  showPropertyTypeOverride?: boolean;
  showChangeButton?: boolean;
  overrideAnswer: (fn: string) => void;
}

function PropertyDetails(props: PropertyDetailsProps) {
  const { data, showPropertyTypeOverride, overrideAnswer } = props;
  const filteredData = data.filter((d) => Boolean(d.detail));

  const { trackEvent } = useAnalyticsTracking();

  const handleOverrideAnswer = (fn: string) => {
    trackEvent({
      event: "backwardsNavigation",
      metadata: null,
      initiator: "change",
    });
    overrideAnswer(fn);
  };

  return (
    <SummaryListTable showChangeButton={true}>
      {filteredData.map(({ heading, detail, fn }: PropertyDetail) => (
        <React.Fragment key={heading}>
          <Box component="dt">{heading}</Box>
          <Box component="dd">{detail}</Box>
          <Box component="dd">
            {showPropertyTypeOverride && fn ? (
              <Link
                component="button"
                style={{ font: "inherit" }}
                onClick={(event) => {
                  event.stopPropagation();
                  // Specify the passport key (eg data.fn, data.val) that should be overwritten
                  handleOverrideAnswer(fn);
                }}
              >
                Change
                <span style={visuallyHidden}>
                  your {heading || "this value"}
                </span>
              </Link>
            ) : (
              ``
            )}
          </Box>
        </React.Fragment>
      ))}
    </SummaryListTable>
  );
}
