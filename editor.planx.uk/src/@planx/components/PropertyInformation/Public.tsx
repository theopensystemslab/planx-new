import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import { property } from "lodash";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Team } from "types";
import { fetchCurrentTeam } from "utils";

import { SiteAddress } from "../FindProperty/model";
import type { PropertyInformation } from "./model";

export default Component;

const ErrorSummaryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid #E91B0C`,
  "& button": {
    background: "none",
    borderStyle: "none",
    color: "#E91B0C",
    cursor: "pointer",
    fontSize: "medium",
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: theme.spacing(2),
    padding: theme.spacing(0),
  },
  "& button:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));

function Component(props: PublicProps<PropertyInformation>) {
  const team = fetchCurrentTeam();
  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();
  const [address, propertyType, flow, breadcrumbs, changeAnswer, record] =
    useStore((state) => [
      state.computePassport().data?._address,
      state.computePassport().data?.["property.type"],
      state.flow,
      state.breadcrumbs,
      state.changeAnswer,
      state.record,
    ]);

  // Fetch supplemental address info via Digital Land
  let options = new URLSearchParams({
    entries: "all", // includes historic
    geometry: `POINT(${address?.longitude} ${address?.latitude})`,
    geometry_relation: "intersects",
    limit: "100",
  });
  options.append("dataset", "local-authority-district");
  options.append("dataset", "region");

  // https://www.planning.data.gov.uk/docs#/Search%20entity
  const root = `https://www.planning.data.gov.uk/entity.json?`;
  const digitalLandEndpoint = root + options;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, error, mutate, isValidating } = useSWR(
    () =>
      address?.latitude && address?.longitude ? digitalLandEndpoint : null,
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  useEffect(() => {
    if (address && data?.count > 0) {
      const lads: string[] = [];
      const regions: string[] = [];
      data.entities.forEach((entity: any) => {
        if (entity.dataset === "local-authority-district") {
          lads.push(entity.name);
        } else if (entity.dataset === "region") {
          regions.push(entity.name);
        }
      });
      setLocalAuthorityDistricts([...new Set(lads)]);
      setRegions([...new Set(regions)]);
    }
  }, [data]);

  return address ? (
    <Presentational
      title={props.title}
      description={props.description}
      address={address}
      propertyType={propertyType}
      localAuthorityDistricts={localAuthorityDistricts}
      regions={regions}
      team={team}
      flow={flow}
      breadcrumbs={breadcrumbs}
      changeAnswer={changeAnswer}
      record={record}
      handleSubmit={props.handleSubmit}
    />
  ) : (
    <Card>
      <ErrorSummaryContainer
        role="status"
        data-testid="error-summary-invalid-graph"
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Invalid graph
        </Typography>
        <Typography variant="body2">
          Edit this flow so that "Property information" is positioned after
          "Find property"; an address is required to render.
        </Typography>
      </ErrorSummaryContainer>
    </Card>
  );
}

interface PresentationalProps {
  title: string;
  description: string;
  address?: SiteAddress;
  propertyType?: string;
  localAuthorityDistricts?: string[];
  regions?: string[];
  team?: Team;
  flow?: Store.flow;
  breadcrumbs?: Store.breadcrumbs;
  changeAnswer: (id: string) => void;
  record: (id: Store.nodeId, userData?: Store.userData) => void;
  handleSubmit?: handleSubmit;
}

const MapContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& my-map": {
    width: "100%",
    height: "50vh",
  },
}));

function Presentational(props: PresentationalProps) {
  const {
    title,
    description,
    address,
    propertyType,
    localAuthorityDistricts,
    regions,
    team,
    flow,
    breadcrumbs,
    changeAnswer,
    record,
    handleSubmit,
  } = props;
  const formik = useFormik({
    initialValues: {},
    onSubmit: () => {
      const newPassportData: any = {};
      if (localAuthorityDistricts) {
        newPassportData["property.localAuthorityDistrict"] =
          localAuthorityDistricts;
      }
      if (regions) {
        newPassportData["property.region"] = regions;
      }

      handleSubmit?.({
        data: newPassportData,
      });
    },
  });

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
      detail: [...new Set(localAuthorityDistricts)]?.join(", ") || team?.name,
    },
    {
      heading: "Building or property type",
      detail: propertyType,
      showChangeButton: true,
      fn: "property.type",
    },
  ];

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <MapContainer>
        <p style={visuallyHidden}>
          A static map centred on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="property-information-map"
          zoom={19.5}
          latitude={address?.latitude}
          longitude={address?.longitude}
          osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
          hideResetControl
          showMarker
          markerLatitude={address?.latitude}
          markerLongitude={address?.longitude}
          // markerColor={team?.settings?.design?.color} // defaults to black
        />
      </MapContainer>
      {propertyDetails && (
        <PropertyDetails
          data={propertyDetails}
          flow={flow}
          breadcrumbs={breadcrumbs}
          changeAnswer={changeAnswer}
          record={record}
          handleSubmit={handleSubmit}
        />
      )}
    </Card>
  );
}

interface PropertyDetail {
  heading: string;
  detail: any;
  showChangeButton?: boolean;
  fn?: string;
}

interface PropertyDetailsProps {
  data: PropertyDetail[];
  flow?: Store.flow;
  breadcrumbs?: Store.breadcrumbs;
  changeAnswer: (id: string) => void;
  record: (id: Store.nodeId, userData?: Store.userData) => void;
  handleSubmit?: handleSubmit;
}

const PropertyDetail = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
}));

function PropertyDetails(props: PropertyDetailsProps) {
  const { data, flow, breadcrumbs, changeAnswer, record, handleSubmit } = props;

  const propertyTypeNodeId = "EOcNxo5xLH";
  const findPropertyNodeId = "yBRu34inRV";

  return (
    <Box component="dl" mb={3}>
      {data.map(({ heading, detail, showChangeButton }: PropertyDetail) => (
        <PropertyDetail key={heading}>
          <Box component="dt" fontWeight={700} flex={"0 0 35%"} py={1}>
            {heading}
          </Box>
          <Box component="dd" flexGrow={1} py={1}>
            {detail}
          </Box>
          {showChangeButton && (
            <Box component="dd" py={1}>
              <Link
                component="button"
                onClick={(event) => {
                  event.stopPropagation();

                  // omit existing property.type key from breadcrumbs in whichever component originally set it
                  record(findPropertyNodeId, {
                    data: {
                      _address: {
                        uprn: "200003453480",
                        blpu_code: "2",
                        latitude: 51.4859056,
                        longitude: -0.0760466,
                        organisation: null,
                        pao: "47",
                        street: "COBOURG ROAD",
                        town: "LONDON",
                        postcode: "SE5 0HU",
                        x: 533683,
                        y: 178083,
                        planx_description: "HMO Parent",
                        planx_value: "residential.HMO.parent",
                        single_line_address:
                          "47, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
                        title: "47, COBOURG ROAD, LONDON",
                      },
                    },
                  });

                  // travel backwards to the first node that sets the property.type key (nodeId is in breadcrumbs, auto-true)
                  changeAnswer(propertyTypeNodeId);
                }}
              >
                Change
                <span style={visuallyHidden}>
                  your {heading || "this value"}
                </span>
              </Link>
            </Box>
          )}
        </PropertyDetail>
      ))}
    </Box>
  );
}
