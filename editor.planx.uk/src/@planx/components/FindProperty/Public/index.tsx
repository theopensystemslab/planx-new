import "./map.css";

import { gql, useQuery } from "@apollo/client";
import { createComponent } from "@lit-labs/react";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { visuallyHidden } from "@material-ui/utils";
import { MyMap } from "@opensystemslab/map";
import { DESCRIPTION_TEXT } from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import capitalize from "lodash/capitalize";
import find from "lodash/find";
import natsort from "natsort";
import { useStore } from "pages/FlowEditor/lib/store";
import { parse, toNormalised } from "postcode";
import React, { useState } from "react";
import { useCurrentRoute } from "react-navi";
import useSWR from "swr";
import CollapsibleInput from "ui/CollapsibleInput";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";

import type { Address, FindProperty } from "../model";
import { DEFAULT_TITLE } from "../model";

// these queries are exported because tests require them
export const FETCH_GLBU_CODES = gql`
  {
    blpu_codes {
      code
      description
      value
    }
  }
`;
export const GET_TEAM_QUERY = gql`
  query GetTeam($team: String = "") {
    teams(where: { slug: { _eq: $team } }) {
      gss_code
      theme
    }
  }
`;

type Props = PublicProps<FindProperty>;

const sorter = natsort({ insensitive: true });

export default Component;

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const [address, setAddress] = useState<Address | undefined>();
  const flow = useStore((state) => state.flow);
  // XXX: In the future, use this API to translate GSS_CODE to Team names (or just pass the GSS_CODE to the API)
  //      https://geoportal.statistics.gov.uk/datasets/fe6bcee87d95476abc84e194fe088abb_0/data?where=LAD20NM%20%3D%20%27Lambeth%27
  //      https://trello.com/c/OmafTN7j/876-update-local-authority-api-to-receive-gsscode-instead-of-nebulous-team-name
  const route = useCurrentRoute();
  const team = route?.data?.team ?? route?.data.mountpath.split("/")[1];

  const { data } = useQuery(GET_TEAM_QUERY, {
    skip: !Boolean(team),
    variables: {
      team: team,
    },
  });

  if (!address && Boolean(data?.teams.length)) {
    return (
      <GetAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
      />
    );
  } else if (address) {
    return (
      <PropertyInformation
        handleSubmit={(feedback?: string) => {
          if (flow && address) {
            const newPassportData: any = {};

            if (address?.planx_value) {
              newPassportData["property.type"] = [address.planx_value];
            }

            const passportData = {
              _address: address,
              ...newPassportData,
            };

            props.handleSubmit?.({
              data: passportData,
            });
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
            detail: address.single_line_address.replace(
              `, ${address.postcode}`,
              ""
            ),
          },
          {
            heading: "Postcode",
            detail: address.postcode,
          },
          {
            heading: "District",
            detail: capitalize(team),
          },
          {
            heading: "Building type",
            detail: address.planx_description,
          },
        ]}
        teamColor={data?.teams?.[0].theme?.primary || "#2c2c2c"}
      />
    );
  } else {
    return (
      <DelayedLoadingIndicator
        msDelayBeforeVisible={0}
        text="Fetching property information..."
      />
    );
  }
}

function GetAddress(props: {
  setAddress: React.Dispatch<React.SetStateAction<Address | undefined>>;
  title?: string;
  description?: string;
  initialPostcode?: string;
  initialSelectedAddress?: Option;
}) {
  const [postcode, setPostcode] = useState<string | null>(
    props.initialPostcode ?? null
  );
  const [sanitizedPostcode, setSanitizedPostcode] = useState<string | null>(
    (props.initialPostcode && toNormalised(props.initialPostcode.trim())) ??
      null
  );
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    props.initialSelectedAddress ?? null
  );
  const [showPostcodeError, setShowPostcodeError] = useState<boolean>(false);

  // Fetch addresses in this postcode from the OS Places API
  const { data: addressesInPostcode } = useSWR(
    () =>
      sanitizedPostcode
        ? `https://api.os.uk/search/places/v1/postcode?postcode=${sanitizedPostcode}&output_srs=EPSG:4326&key=${process.env.REACT_APP_ORDNANCE_SURVEY_KEY}&lr=EN`
        : null,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 3,
    }
  );

  // Fetch blpu_codes records so that we can join address CLASSIFICATION_CODE to planx variable
  const { data: blpuCodes } = useQuery(FETCH_GLBU_CODES);

  // XXX: Map OS Places API fields to legacy address_base fields, eventually we may want to
  //    refactor model.ts to better align to OS Places DPA or LPI output
  const addresses: Address[] = [];
  if (
    Boolean(addressesInPostcode?.results?.length) &&
    Boolean(blpuCodes?.blpu_codes?.length)
  ) {
    addressesInPostcode.results.map((a: any) => {
      addresses.push({
        uprn: a.DPA.UPRN.padStart(12, "0"),
        blpu_code: a.DPA.BLPU_STATE_CODE,
        latitude: a.DPA.LAT,
        longitude: a.DPA.LNG,
        organisation: a.DPA.ORGANISATION_NAME || null,
        sao: null,
        pao: a.DPA.BUILDING_NUMBER,
        street: a.DPA.THOROUGHFARE_NAME,
        town: a.DPA.POST_TOWN,
        postcode: a.DPA.POSTCODE,
        x: a.DPA.X_COORDINATE,
        y: a.DPA.Y_COORDINATE,
        planx_description:
          find(blpuCodes.blpu_codes, { code: a.DPA.CLASSIFICATION_CODE })
            ?.description || null,
        planx_value:
          find(blpuCodes.blpu_codes, { code: a.DPA.CLASSIFICATION_CODE })
            ?.value || null,
        single_line_address: a.DPA.ADDRESS,
      });
    });
  }

  // Autocomplete overrides
  const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
        // Default transform is "translate(14px, 20px) scale(1)""
        // This lines up the label with the initial cursor position in the input
        // after changing its padding-left.
        transform: "translate(34px, 20px) scale(1);",
      },
    },
    inputRoot: {
      color: "#000",
      fontSize: "inherit",
      borderRadius: 0,
      "& fieldset": {
        border: "2px solid black",
      },
      '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child': {
        borderRadius: 0,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: 0,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderRadius: 0,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderRadius: 0,
      },
    },
    input: {
      padding: theme.spacing(1),
    },
    option: {
      fontSize: "inherit",
      // Hover
      '&[data-focus="true"]': {
        backgroundColor: theme.palette.grey[800],
        borderColor: "transparent",
        color: "white",
      },
      // Selected
      '&[aria-selected="true"]': {
        backgroundColor: theme.palette.grey[800],
        borderColor: "transparent",
        color: "white",
      },
    },
  }));
  const classes = useStyles();

  const handleCheckPostcode = () => {
    if (!sanitizedPostcode) setShowPostcodeError(true);
  };

  // XXX: If you press a key on the keyboard, you expect something to show up on the screen,
  //      so this code attempts to validate postcodes without blocking any characters.
  const handlePostcodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Reset the address on change of postcode - ensures no visual mismatch between address and postcode
    if (selectedOption) setSelectedOption(null);
    // Validate and set Postcode
    const input = e.target.value;
    if (parse(input.trim()).valid) {
      setSanitizedPostcode(toNormalised(input.trim()));
      setPostcode(toNormalised(input.trim()));
    } else {
      setSanitizedPostcode(null);
      setPostcode(input.toUpperCase());
    }
  };

  return (
    <Card
      handleSubmit={() => props.setAddress(selectedOption ?? undefined)}
      isValid={Boolean(selectedOption)}
    >
      <QuestionHeader
        title={props.title || DEFAULT_TITLE}
        description={props.description || ""}
      />
      <Box pb={2}>
        <InputLabel label="Postcode" htmlFor="postcode-input">
          <Input
            required
            bordered
            name="postcode"
            id="postcode-input"
            value={postcode || ""}
            errorMessage={
              showPostcodeError && !sanitizedPostcode
                ? "Enter a valid UK postcode"
                : ""
            }
            onChange={(e) => handlePostcodeInputChange(e)}
            onKeyUp={({ key }) => {
              if (key === "Enter") handleCheckPostcode();
            }}
            onBlur={handleCheckPostcode}
            style={{ marginBottom: "20px" }}
            inputProps={{
              maxLength: 8,
              "aria-describedby": props.description ? DESCRIPTION_TEXT : "",
            }}
          />
        </InputLabel>
        {Boolean(addresses.length) && (
          <Autocomplete
            classes={classes}
            options={addresses
              .map(
                (address: Address): Option => ({
                  ...address,
                  // we already know the postcode so remove it from full address
                  title: address.single_line_address.replace(
                    `, ${address.postcode}`,
                    ""
                  ),
                })
              )
              .sort((a: Option, b: Option) => sorter(a.title, b.title))}
            getOptionLabel={(option: Option) => option.title}
            getOptionSelected={(option: Option, selected: Option) =>
              option.uprn === selected.uprn
            }
            noOptionsText="No addresses"
            data-testid="autocomplete-input"
            value={selectedOption}
            renderInput={(params) => (
              <InputLabel label="Select an address">
                <TextField
                  {...params}
                  variant="outlined"
                  aria-label="Select an address"
                />
              </InputLabel>
            )}
            onChange={(event, selectedOption) => {
              if (selectedOption) {
                setSelectedOption(selectedOption);
              }
            }}
            disablePortal
            disableClearable
            PaperComponent={({ children }) => (
              <Paper style={{ borderRadius: 0, boxShadow: "none" }}>
                {children}
              </Paper>
            )}
          />
        )}
        {addressesInPostcode?.header?.totalresults === 0 &&
          Boolean(sanitizedPostcode) && (
            <Box pt={2}>
              <Typography variant="body1" color="error">
                No addresses found in this postcode.
              </Typography>
            </Box>
          )}
      </Box>
    </Card>
  );
}

interface Option extends Address {
  title: string;
}

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
  constraint: {
    borderLeft: `3px solid rgba(0,0,0,0.3)`,
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
  },
  propertyDetail: {
    display: "flex",
    justifyContent: "flex-start",
    borderBottom: `1px solid ${theme.palette.background.paper}`,
  },
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
  } = props;
  const styles = useClasses();
  const formik = useFormik({
    initialValues: {
      feedback: "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(values.feedback, {
          reason: "Inaccurate property details",
          property: propertyDetails,
        });
      }
      handleSubmit?.();
    },
  });

  const findPropertyMapProps = {
    zoom: 19.5,
    latitude: lat,
    longitude: lng,
    osVectorTilesApiKey: process.env.REACT_APP_ORDNANCE_SURVEY_KEY,
    hideResetControl: true,
    showFeaturesAtPoint: true,
    osFeaturesApiKey: process.env.REACT_APP_ORDNANCE_SURVEY_KEY,
    featureColor: teamColor,
    featureFill: true,
  } as any;

  // ref https://www.npmjs.com/package/@lit-labs/react
  const FindPropertyMapComponent = createComponent(React, "my-map", MyMap);

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <Box className={styles.map}>
        <p style={visuallyHidden}>
          A static map centered on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        <FindPropertyMapComponent {...findPropertyMapProps} />
      </Box>
      <Box component="dl" mb={6}>
        {propertyDetails.map(({ heading, detail }: any) => (
          <Box className={styles.propertyDetail} key={heading}>
            <Box component="dt" fontWeight={700} flex={"0 0 35%"} py={1}>
              {heading}
            </Box>
            <Box component="dd" flexGrow={1} py={1}>
              {detail}
            </Box>
          </Box>
        ))}
      </Box>
      <Box color="text.secondary" textAlign="right">
        <CollapsibleInput
          handleChange={formik.handleChange}
          name="feedback"
          value={formik.values.feedback}
        >
          <Typography variant="body2" color="inherit">
            Report an inaccuracy
          </Typography>
        </CollapsibleInput>
      </Box>
    </Card>
  );
}
