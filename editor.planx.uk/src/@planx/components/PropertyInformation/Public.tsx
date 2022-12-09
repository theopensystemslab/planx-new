import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import FeedbackInput from "@planx/components/shared/FeedbackInput";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import type { PropertyInformation } from "./model";

const MapContainer = styled(Box)(({ theme }) => ({
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

export default Component;

function Component(props: any) {
  const {
    title,
    description,
    propertyDetails,
    handleSubmit,
    previousFeedback,
  } = props;

  const [longitude, latitude] = useStore((state) => [
    state.computePassport().data?._address?.longitude,
    state.computePassport().data?._address?.latitude,
  ]);

  const formik = useFormik({
    initialValues: {
      feedback: previousFeedback || "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(values.feedback, {
          reason: "Inaccurate property details",
          property: propertyDetails,
        });
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
          latitude={latitude}
          longitude={longitude}
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          hideResetControl
          showMarker
          markerLatitude={latitude}
          markerLongitude={longitude}
        />
      </MapContainer>
      <Box component="dl" mb={3}>
        {propertyDetails?.map(({ heading, detail }: any) => (
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

// else if (address) {
//   return (
//     <PropertyInformation
//       previousFeedback={props.previouslySubmittedData?.feedback}
//       handleSubmit={({ feedback }: { feedback?: string }) => {
//         if (flow && address) {
//           const newPassportData: any = {};

//           if (address?.planx_value) {
//             newPassportData["property.type"] = [address.planx_value];
//           }

//           if (localAuthorityDistricts) {
//             newPassportData["property.localAuthorityDistrict"] =
//               localAuthorityDistricts;
//           }

//           if (regions) {
//             newPassportData["property.region"] = regions;
//           }

//           const passportData = {
//             _address: address,
//             ...newPassportData,
//           };

//           const submissionData: any = {
//             data: passportData,
//           };

//           if (feedback) {
//             submissionData.feedback = feedback;
//           }

//           props.handleSubmit?.(submissionData);
//         } else {
//           throw Error("Should not have been clickable");
//         }
//       }}
//       lng={address.longitude}
//       lat={address.latitude}
//       title="About the property"
//       description="This is the information we currently have about the property"
//       propertyDetails={[
//         {
//           heading: "Address",
//           detail: address.title,
//         },
//         {
//           heading: "Postcode",
//           detail: address.postcode,
//         },
//         {
//           heading: "Local planning authority",
//           detail: localAuthorityDistricts?.join(", ") || team?.name,
//         },
//         {
//           heading: "Building type", // XXX: does this heading still make sense for infra?
//           detail: address.planx_description,
//         },
//       ]}
//       teamColor={team?.theme?.primary || "#2c2c2c"}
//     />
//   );
// }
