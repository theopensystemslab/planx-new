import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchCurrentTeam } from "utils";

import FeedbackInput from "../shared/FeedbackInput";
import type { PropertyInformation } from "./model";

type Props = PublicProps<PropertyInformation>;

interface PropertyDetail {
  heading: string;
  detail: any;
}

export default Component;

const MapContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& my-map": {
    width: "100%",
    height: "50vh",
  },
}));

const useClasses = makeStyles((theme) => ({
  errorSummary: {
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
  },
}));

function Component(props: Props) {
  const [address, propertyType] = useStore((state) => [
    state.computePassport().data?._address,
    state.computePassport().data?.["property.type"],
  ]);
  const team = fetchCurrentTeam();
  const classes = useClasses();

  const formik = useFormik({
    initialValues: {
      feedback: props.previouslySubmittedData?.feedback || "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(values.feedback, "Inaccurate property details", address);
      }

      const newPassportData: any = {};
      if (localAuthorityDistricts) {
        newPassportData["property.localAuthorityDistrict"] =
          localAuthorityDistricts;
      }
      if (regions) {
        newPassportData["property.region"] = regions;
      }

      props.handleSubmit?.({
        ...values,
        data: newPassportData,
      });
    },
  });

  const [localAuthorityDistricts, setLocalAuthorityDistricts] = useState<
    string[] | undefined
  >();
  const [regions, setRegions] = useState<string[] | undefined>();
  const [propertyDetails, setPropertyDetails] = useState<
    PropertyDetail[] | undefined
  >();

  // if we have an address point, check which local authority district(s) & region it's located in via Digital Land
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

        setPropertyDetails([
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
            detail: [...new Set(lads)]?.join(", ") || team?.name,
          },
          {
            heading: "Building or property type",
            detail: address?.planx_description,
          },
        ]);
      }
    }
  }, [data]);

  if (!address) {
    return (
      <div className={classes.errorSummary} role="status">
        <Typography variant="h5" component="h2" gutterBottom>
          Invalid graph
        </Typography>
        <Typography variant="body2">
          Edit this flow so that "Property information" is positioned after
          "Find property"; an address is required to render.
        </Typography>
      </div>
    );
  } else {
    return (
      <Card handleSubmit={formik.handleSubmit} isValid>
        <QuestionHeader title={props.title} description={props.description} />
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
        {propertyDetails ? (
          <PropertyDetails data={propertyDetails} />
        ) : (
          <DelayedLoadingIndicator text="fetching data" />
        )}
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
}

const PropertyDetail = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
}));

function PropertyDetails(props: { data: PropertyDetail[] }) {
  const { data } = props;

  return (
    <Box component="dl" mb={3}>
      {data.map(({ heading, detail }: any) => (
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
  );
}
