import "./map.css";

import { gql, useQuery } from "@apollo/client";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { visuallyHidden } from "@material-ui/utils";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
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
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { TeamSettings } from "types";
import CollapsibleInput from "ui/CollapsibleInput";
import ExternalPlanningSiteDialog, {
  DialogPurpose,
} from "ui/ExternalPlanningSiteDialog";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import { fetchCurrentTeam } from "utils";

import type { Address, FindProperty } from "../model";
import { DEFAULT_TITLE } from "../model";

// these queries are exported because tests require them
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

const sorter = natsort({ insensitive: true });

export default Component;

function Component(props: Props) {
  const previouslySubmittedData = props.previouslySubmittedData?.data;
  const [address, setAddress] = useState<Address | undefined>();
  const flow = useStore((state) => state.flow);
  const team = fetchCurrentTeam();

  if (!address && Boolean(team)) {
    return (
      <GetAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        initialPostcode={previouslySubmittedData?._address.postcode}
        initialSelectedAddress={previouslySubmittedData?._address}
        teamSettings={team?.settings}
      />
    );
  } else if (address) {
    let warning: {
      show: boolean;
      os_administrative_area: string;
      os_local_custodian_code: string;
      planx_team_name?: string;
    } = {
      show: false,
      os_administrative_area: address.administrative_area,
      os_local_custodian_code: address.local_custodian_code,
    };

    if (team?.name) {
      // if neither admin area nor LCC match team, then show warning error msg
      warning.show = ![
        address.administrative_area,
        address.local_custodian_code,
      ].includes(team.name.toUpperCase());
      warning.planx_team_name = team.name.toUpperCase();
    }

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
              _addressWarning: warning,
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
            detail: address.title,
          },
          {
            heading: "Postcode",
            detail: address.postcode,
          },
          {
            heading: "District",
            detail: team?.name,
          },
          {
            heading: "Building type", // XXX: does this heading still make sense for infra?
            detail: address.planx_description,
          },
        ]}
        team={team}
        teamColor={team?.theme?.primary || "#2c2c2c"}
        error={warning.show}
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
  teamSettings?: TeamSettings;
}) {
  const [postcode, setPostcode] = useState<string | null>(
    props.initialPostcode ?? null
  );
  const [sanitizedPostcode, setSanitizedPostcode] = useState<string | null>(
    (props.initialPostcode && toNormalised(props.initialPostcode.trim())) ??
      null
  );
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    props.initialSelectedAddress ?? undefined
  );
  const [showPostcodeError, setShowPostcodeError] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [totalAddresses, setTotalAddresses] = useState<number | undefined>(
    undefined
  );
  const [addressesInPostcode, setAddressesInPostcode] = useState<any[]>([]);

  // Fetch addresses in this postcode from the OS Places API
  // https://apidocs.os.uk/docs/os-places-service-metadata
  let osPlacesEndpoint = `https://api.os.uk/search/places/v1/postcode?postcode=${sanitizedPostcode}&dataset=LPI&output_srs=EPSG:4326&lr=EN&key=${process.env.REACT_APP_ORDNANCE_SURVEY_KEY}&maxresults=100`;

  const { data } = useSWR(
    () => (sanitizedPostcode ? osPlacesEndpoint + `&offset=${offset}` : null),
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 3,
    }
  );

  useEffect(() => {
    if (data && !data?.error) {
      // Concat results to existing list of addresses for cases of paginated results
      const concatenated = addressesInPostcode.concat(data.results || []);
      setAddressesInPostcode(concatenated);
      setTotalAddresses(data.header.totalresults);
      // console.log("fetched", concatenated.length, "/", data.header.totalresults);
    }
  }, [data]);

  // Fetch blpu_codes records so that we can join address CLASSIFICATION_CODE to planx variable
  const { data: blpuCodes } = useQuery(FETCH_BLPU_CODES);

  // XXX: Map OS Places API fields to legacy address_base fields, eventually we may want to
  //    refactor model.ts to better align to OS Places DPA or LPI output
  const addresses: Address[] = [];
  if (
    Boolean(addressesInPostcode.length) &&
    Boolean(blpuCodes?.blpu_codes?.length)
  ) {
    addressesInPostcode
      // Only show "APPROVED" addresses, filter out "ALTERNATIVE", "HISTORIC", or "PROVISIONAL" records
      // https://www.ordnancesurvey.co.uk/documents/product-support/tech-spec/addressbase-premium-technical-specification.pdf (p61)
      .filter((a) => a.LPI.LPI_LOGICAL_STATUS_CODE_DESCRIPTION === "APPROVED")
      .map((a) => {
        addresses.push({
          uprn: a.LPI.UPRN.padStart(12, "0"),
          blpu_code: a.LPI.BLPU_STATE_CODE,
          latitude: a.LPI.LAT,
          longitude: a.LPI.LNG,
          organisation: a.LPI.ORGANISATION || null,
          sao: a.LPI.SAO_TEXT,
          pao: [a.LPI.PAO_START_NUMBER, a.LPI.PAO_START_SUFFIX]
            .filter(Boolean)
            .join(""), // docs reference PAO_TEXT, but not found in response so roll our own
          street: a.LPI.STREET_DESCRIPTION,
          town: a.LPI.TOWN_NAME,
          postcode: a.LPI.POSTCODE_LOCATOR,
          x: a.LPI.X_COORDINATE,
          y: a.LPI.Y_COORDINATE,
          planx_description:
            find(blpuCodes.blpu_codes, { code: a.LPI.CLASSIFICATION_CODE })
              ?.description || null,
          planx_value:
            find(blpuCodes.blpu_codes, { code: a.LPI.CLASSIFICATION_CODE })
              ?.value || null,
          single_line_address: a.LPI.ADDRESS,
          administrative_area: a.LPI.ADMINISTRATIVE_AREA, // local highway authority name (proxy for local authority?)
          local_custodian_code: a.LPI.LOCAL_CUSTODIAN_CODE_DESCRIPTION, // similar to GSS_CODE, but may not reflect merged councils
          title: a.LPI.ADDRESS.split(`, ${a.LPI.ADMINISTRATIVE_AREA}`)[0], // display value used in autocomplete dropdown & FindProperty
        });
      });
  }

  // Autocomplete overrides
  const useStyles = makeStyles((theme) => ({
    root: {
      paddingBottom: theme.spacing(1),
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
        "& legend": {
          lineHeight: "13px",
        },
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
        border: "2px solid black",
        boxShadow: "inset 0 0 0 2px",
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
    if (selectedOption) {
      setSelectedOption(undefined);
    }

    // Also reset any previously fetched addresses - ensures new results aren't concatenated to prev options
    if (totalAddresses && Boolean(addressesInPostcode.length)) {
      setOffset(0);
      setTotalAddresses(undefined);
      setAddressesInPostcode([]);
    }

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
      handleSubmit={() => props.setAddress(selectedOption)}
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
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                showPostcodeError && !sanitizedPostcode ? ERROR_MESSAGE : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
        {Boolean(addresses.length) && (
          <Autocomplete
            role="status"
            aria-atomic={true}
            aria-live="polite"
            classes={classes}
            options={addresses
              .map(
                (address: Address): Option => ({
                  ...address,
                  title: address.title,
                })
              )
              .sort((a: Option, b: Option) => sorter(a.title, b.title))}
            getOptionLabel={(option: Option) => option.title}
            getOptionSelected={(option: Option, selected: Option) =>
              option.uprn === selected.uprn
            }
            noOptionsText="No addresses"
            data-testid="autocomplete-input"
            value={selectedOption ?? (null as any as undefined)}
            renderInput={(params) => (
              <InputLabel label="Select an address" htmlFor="address-textfield">
                <TextField
                  {...params}
                  variant="outlined"
                  aria-label="Select an address in this postcode by typing or using your arrow keys"
                  id="address-textfield"
                />
              </InputLabel>
            )}
            onChange={(event, selectedOption) => {
              if (selectedOption) {
                setSelectedOption(selectedOption);
              }
            }}
            onOpen={(event) => {
              // Fetch additional paginated results from OS Places if they exist, concat results to options before input
              if (
                totalAddresses &&
                totalAddresses > addressesInPostcode.length
              ) {
                setOffset(addressesInPostcode.length);
              }
            }}
            disablePortal
            disableClearable
            handleHomeEndKeys
            PaperComponent={({ children }) => (
              <Paper style={{ borderRadius: 0, boxShadow: "none" }}>
                {children}
              </Paper>
            )}
          />
        )}
        {(data?.error || totalAddresses === 0) && Boolean(sanitizedPostcode) && (
          <Box pt={2} role="status">
            <Typography variant="body1" color="error">
              {data?.error?.message || "No addresses found in this postcode."}
            </Typography>
          </Box>
        )}
        <ExternalPlanningSiteDialog
          purpose={DialogPurpose.MissingAddress}
          teamSettings={props.teamSettings}
        ></ExternalPlanningSiteDialog>
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
    team,
    teamColor,
    error,
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

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <Box className={styles.map}>
        <p style={visuallyHidden}>
          A static map centered on the property address, showing the Ordnance
          Survey basemap features.
        </p>
        {/* @ts-ignore */}
        <my-map
          id="property-information-map"
          zoom={19.5}
          latitude={lat}
          longitude={lng}
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          hideResetControl
          showFeaturesAtPoint
          osFeaturesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          featureColor={teamColor}
          featureFill
        />
      </Box>
      <Box component="dl" mb={3}>
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
      {error && team?.name && (
        <Box role="status">
          <Typography variant="body1" color="error">
            This address may not be in {capitalize(team.name)}, are you sure you
            want to continue using this service?
          </Typography>
        </Box>
      )}
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
