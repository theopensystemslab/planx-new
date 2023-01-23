import { gql } from "@apollo/client";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import FeedbackInput from "@planx/components/shared/FeedbackInput";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchCurrentTeam } from "utils";

import { FindProperty, SiteAddress } from "../model";
import PickOSAddress from "./Autocomplete";
import PlotNewAddress from "./Map";

// This query is exported because tests require it
export const FETCH_BLPU_CODES = gql`
  {
    blpu_codes {
      code
      description
      value
    }
  }
`;

type Props = PublicProps<FindProperty>;

export default Component;

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const previouslySubmittedAddressSource =
    props.previouslySubmittedData?.data?._address?.source;
  const startPage =
    previouslySubmittedAddressSource === "proposed"
      ? "new-address"
      : "os-address";

  const [page, setPage] = useState<"os-address" | "new-address">(startPage);
  const [address, setAddress] = useState<SiteAddress | undefined>();
  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();

  const flow = useStore((state) => state.flow);
  const team = fetchCurrentTeam();

  // Use the address point to fetch the Local Authority District(s) & region via Digital Land
  let options = new URLSearchParams({
    entries: "all", // includes historic for pre-merger LADs (eg Wycombe etc for Uniform connector mappings)
    geometry: `POINT(${address?.longitude} ${address?.latitude})`,
    geometry_relation: "intersects",
    limit: "100",
  });
  options.append("dataset", "local-authority-district");
  options.append("dataset", "region"); // proxy for Greater London Authority (GLA) boundary

  // https://www.planning.data.gov.uk/docs#/Search%20entity
  const root = `https://www.planning.data.gov.uk/entity.json?`;
  const digitalLandEndpoint = root + options;
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data } = useSWR(
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
    if (address && data) {
      if (data.count > 0) {
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
    }
  }, [data]);

  if (!address && Boolean(team) && page === "os-address") {
    return (
      <PickOSAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
        teamSettings={team?.settings}
        id={props.id}
        setPage={setPage}
      />
    );
  } else if (!address && Boolean(team) && page === "new-address") {
    return (
      <PlotNewAddress
        title={props.newAddressTitle}
        description={props.newAddressDescription}
        setAddress={setAddress}
        initialProposedAddress={previouslySubmittedData?._address}
        teamSettings={team?.settings}
        id={props.id}
        setPage={setPage}
      />
    );
  } else if (address) {
    return (
      <PropertyInformation
        previousFeedback={props.previouslySubmittedData?.feedback}
        handleSubmit={({ feedback }: { feedback?: string }) => {
          if (flow && address) {
            const newPassportData: any = {};

            if (address?.planx_value) {
              newPassportData["property.type"] = [address.planx_value];
            }

            if (localAuthorityDistricts) {
              newPassportData["property.localAuthorityDistrict"] =
                localAuthorityDistricts;
            }

            if (regions) {
              newPassportData["property.region"] = regions;
            }

            const passportData = {
              _address: address,
              ...newPassportData,
            };

            const submissionData: any = {
              data: passportData,
            };

            if (feedback) {
              submissionData.feedback = feedback;
            }

            props.handleSubmit?.(submissionData);
          } else {
            throw Error("Should not have been clickable");
          }
        }}
        lng={address.longitude}
        lat={address.latitude}
        title="About the property"
        description="This is the information we currently have about the property"
        propertyDetails={[
          {
            heading: "Address",
            detail: address.title,
          },
          {
            heading: "Postcode",
            detail: address.postcode,
          },
          {
            heading: "Local planning authority",
            detail: localAuthorityDistricts?.join(", ") || team?.name,
          },
          {
            heading: "Building type", // XXX: does this heading still make sense for infra?
            detail: address.planx_description,
          },
        ]}
        teamColor={team?.theme?.primary || "#2c2c2c"}
      />
    );
  } else {
    return <DelayedLoadingIndicator text="Fetching property information..." />;
  }
}

export const MapContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& my-map": {
    width: "100%",
    height: "50vh",
  },
}));

const PropertyDetail = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
}));

export function PropertyInformation(props: any) {
  const {
    title,
    description,
    propertyDetails,
    lat,
    lng,
    handleSubmit,
    teamColor,
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
          "Inaccurate property details",
          propertyDetails
        );
      }
      handleSubmit?.(values);
    },
  });

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
          latitude={lat}
          longitude={lng}
          osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
          hideResetControl
          showMarker
          markerLatitude={lat}
          markerLongitude={lng}
          // markerColor={teamColor} // defaults to black
        />
      </MapContainer>
      <Box component="dl" mb={3}>
        {propertyDetails.map(({ heading, detail }: any) => (
          <PropertyDetail key={heading}>
            <Box component="dt" fontWeight={700} flex={"0 0 35%"} py={1}>
              {heading}
            </Box>
            <Box component="dd" flexGrow={1} py={1}>
              {detail}
            </Box>
          </PropertyDetail>
        ))}
      </Box>
      <Box textAlign="right">
        <FeedbackInput
          text="Report an inaccuracy"
          handleChange={formik.handleChange}
          value={formik.values.feedback}
        />
      </Box>
    </Card>
  );
}
