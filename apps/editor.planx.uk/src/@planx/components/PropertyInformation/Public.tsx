import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import type { PublicProps } from "@planx/components/shared/types";
import { GraphError } from "components/Error/GraphError";
import { Feature } from "geojson";
import { type BLPUCode, useBLPUCodes } from "hooks/data/useBLPUCodes";
import find from "lodash/find";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import { HandleSubmit } from "pages/Preview/Node";
import React from "react";

import type { SiteAddress } from "../FindProperty/model";
import { MapContainer } from "../shared/Preview/MapContainer";
import type { PropertyInformation } from "./model";

export default Component;

function Component(props: PublicProps<PropertyInformation>) {
  const [passport, overrideAnswer] = useStore((state) => [
    state.computePassport(),
    state.overrideAnswer,
  ]);
  const { data } = useBLPUCodes();

  if (!passport.data?._address)
    throw new GraphError("nodeMustFollowFindProperty");

  return (
    <Presentational
      title={props.title}
      description={props.description}
      info={props.info}
      policyRef={props.policyRef}
      howMeasured={props.howMeasured}
      showPropertyTypeOverride={props.showPropertyTypeOverride}
      address={passport.data?._address}
      propertyType={passport.data?.["property.type"]}
      localAuthorityDistrict={
        passport.data?.["property.localAuthorityDistrict"]
      }
      localPlanningAuthority={
        passport.data?.["property.localPlanningAuthority"]
      }
      titleBoundary={passport.data?.["property.boundary"]}
      blpuCodes={data?.blpuCodes}
      overrideAnswer={overrideAnswer}
      handleSubmit={() => {
        const passportData: Record<string, any> = {};

        // If property types are not supported, overwrite does not apply
        if (!props.showPropertyTypeOverride) {
          passportData["propertyInformation.action"] =
            "Property type not supported";
        } else {
          // If the user changed their property type, they'll already have a previous PropertyInformation breadcrumb that set `_overrides`
          const hasOverrodeAnswer =
            passport.data?.["_overrides"]?.["property.type"];
          passportData["propertyInformation.action"] = hasOverrodeAnswer
            ? "Changed the property type"
            : "Accepted the property type";
        }

        props.handleSubmit?.({
          data: passportData,
        });
      }}
    />
  );
}

// Exported for tests
export interface PresentationalProps extends PropertyInformation {
  address?: SiteAddress;
  propertyType?: string[];
  localAuthorityDistrict?: string[];
  localPlanningAuthority?: string[];
  titleBoundary?: Feature;
  blpuCodes?: BLPUCode[];
  overrideAnswer: (fn: string) => void;
  handleSubmit?: HandleSubmit;
}

// Export this component for testing visual presentation with mocked props
export function Presentational(props: PresentationalProps) {
  const {
    title,
    description,
    info,
    policyRef,
    howMeasured,
    showPropertyTypeOverride,
    address,
    propertyType,
    localAuthorityDistrict,
    localPlanningAuthority,
    titleBoundary,
    blpuCodes,
    overrideAnswer,
    handleSubmit,
  } = props;
  const [environment] = useStore((state) => [state.previewEnvironment]);

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
      heading: "Local authority district",
      detail: localAuthorityDistrict?.join(", ") || "Unknown",
    },
    {
      heading: "Local planning authority",
      detail: localPlanningAuthority?.join(", ") || "Unknown",
    },
    ...(showPropertyTypeOverride
      ? [
          {
            heading: "Property type",
            detail:
              find(blpuCodes, { value: propertyType?.[0] })?.description ||
              propertyType?.[0] ||
              "Unknown",
            fn: "property.type",
          },
        ]
      : []),
  ];

  return (
    <Card handleSubmit={handleSubmit}>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
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
          osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS AC0000812160`}
          geojsonDataCopyright={`<a href="https://www.planning.data.gov.uk/dataset/title-boundary" target="_blank" style="color:#0010A4;">Title boundary (opens in a new tab)</a> subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100026316`}
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
