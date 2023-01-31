import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React from "react";
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
  const [address, propertyType, localAuthorityDistrict, overrideAnswer] =
    useStore((state) => [
      state.computePassport().data?._address,
      state.computePassport().data?.["property.type"],
      state.computePassport().data?.["property.localAuthorityDistrict"],
      state.overrideAnswer,
    ]);

  return address ? (
    <Presentational
      title={props.title}
      description={props.description}
      address={address}
      propertyType={propertyType}
      localAuthorityDistrict={localAuthorityDistrict}
      team={team}
      overrideAnswer={overrideAnswer}
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
  localAuthorityDistrict?: string[];
  team?: Team;
  overrideAnswer: (fn: string) => void;
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
    localAuthorityDistrict,
    team,
    overrideAnswer,
    handleSubmit,
  } = props;
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
      detail: localAuthorityDistrict?.join(", ") || team?.name,
    },
    {
      heading: "Property type",
      detail: propertyType || "Unknown",
      showChangeButton: true,
      fn: "property.type",
    },
  ];

  return (
    <Card handleSubmit={handleSubmit} isValid>
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
          overrideAnswer={overrideAnswer}
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
  overrideAnswer: (fn: string) => void;
}

// Borrows and tweaks grid style from Review page's `SummaryList`
const PropertyDetailsList = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 2fr 100px",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  "& > *": {
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    verticalAlign: "top",
    margin: 0,
  },
  "& ul": {
    listStylePosition: "inside",
    padding: 0,
    margin: 0,
  },
  "& >:nth-child(3n+1)": {
    // left column
    fontWeight: 700,
  },
  "& >:nth-child(3n+2)": {
    // middle column
    paddingLeft: "10px",
  },
  "& >:nth-child(3n+3)": {
    // right column
    textAlign: "right",
  },
}));

function PropertyDetails(props: PropertyDetailsProps) {
  const { data, overrideAnswer } = props;

  return (
    <PropertyDetailsList component="dl">
      {data.map(({ heading, detail, showChangeButton, fn }: PropertyDetail) => (
        <React.Fragment key={heading}>
          <Box component="dt">{heading}</Box>
          <Box component="dd">{detail}</Box>
          {showChangeButton && fn ? (
            <Box component="dd">
              <Link
                component="button"
                onClick={(event) => {
                  event.stopPropagation();
                  // Specify the passport key (eg data.fn, data.val) that should be overwritten
                  overrideAnswer(fn);
                }}
              >
                Change
                <span style={visuallyHidden}>
                  your {heading || "this value"}
                </span>
              </Link>
            </Box>
          ) : (
            <Box component="dd">
              {/** ensure there's always a third column to not break styling, even when showChangeButton is false */}
            </Box>
          )}
        </React.Fragment>
      ))}
    </PropertyDetailsList>
  );
}
