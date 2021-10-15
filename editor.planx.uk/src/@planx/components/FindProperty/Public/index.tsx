import "./map.css";

import { gql, useQuery } from "@apollo/client";
import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Card from "@planx/components/shared/Preview/Card";
import FormInput from "@planx/components/shared/Preview/FormInput";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { addressesClientForPizzas, client } from "lib/graphql";
import capitalize from "lodash/capitalize";
import natsort from "natsort";
import { useStore } from "pages/FlowEditor/lib/store";
import { parse, toNormalised } from "postcode";
import React, { useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useCurrentRoute } from "react-navi";
import useSWR from "swr";
import CollapsibleInput from "ui/CollapsibleInput";

import type { Address, FindProperty } from "../model";
import { DEFAULT_TITLE } from "../model";

type Props = PublicProps<FindProperty>;

const sorter = natsort({ insensitive: true });

export default Component;

function Component(props: Props) {
  const [address, setAddress] = useState<Address | undefined>();
  const [flow, startSession] = useStore((state) => [
    state.flow,
    state.startSession,
  ]);

  // XXX: In the future, use this API to translate GSS_CODE to Team names (or just pass the GSS_CODE to the API)
  //      https://geoportal.statistics.gov.uk/datasets/fe6bcee87d95476abc84e194fe088abb_0/data?where=LAD20NM%20%3D%20%27Lambeth%27
  //      https://trello.com/c/OmafTN7j/876-update-local-authority-api-to-receive-gsscode-instead-of-nebulous-team-name
  const route = useCurrentRoute();
  const team = route?.data?.team ?? route.data.mountpath.split("/")[1];

  const { data } = useQuery(
    gql`
      query GetTeam($team: String = "") {
        teams(where: { slug: { _eq: $team } }) {
          gss_code
          theme
        }
      }
    `,
    {
      skip: !Boolean(team),
      variables: {
        team: team,
      },
    }
  );

  const { data: constraints } = useSWR(
    () =>
      address
        ? `${process.env.REACT_APP_API_URL}/gis/${team}?x=${address.x}&y=${address.y}&version=1`
        : null,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 1000,
      errorRetryCount: 3,
    }
  );

  if (!address && Boolean(data?.teams.length)) {
    return (
      <GetAddress
        title={props.title}
        description={props.description}
        setAddress={setAddress}
        gssCode={data?.teams?.[0].gss_code}
      />
    );
  } else if (address && constraints) {
    return (
      <PropertyInformation
        handleSubmit={(feedback?: string) => {
          if (flow && address && constraints) {
            const _nots: any = {};
            const newPassportData: any = {};

            Object.entries(constraints).forEach(([key, data]: any) => {
              if (data.value) {
                newPassportData["property.constraints.planning"] ||= [];
                newPassportData["property.constraints.planning"].push(key);
              } else {
                _nots["property.constraints.planning"] ||= [];
                _nots["property.constraints.planning"].push(key);
              }
            });

            if (address?.planx_value) {
              newPassportData["property.type"] = address.planx_value;
            }

            const passportData = {
              _address: address,
              ...newPassportData,
              _nots,
            };

            props.handleSubmit?.({
              data: passportData,
            });

            startSession({ passport: passportData });
          } else {
            throw Error("Should not have been clickable");
          }
        }}
        lng={Number(address.longitude)}
        lat={Number(address.latitude)}
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
        propertyConstraints={{
          title: "Planning constraints",
          description: "Things that might affect your project",
          constraints: (Object.values(constraints) || []).filter(
            ({ text }: any) => text
          ),
        }}
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
  gssCode: string;
}) {
  const [postcode, setPostcode] = useState<string | null>();
  const [sanitizedPostcode, setSanitizedPostcode] = useState<string | null>();
  const [selectedOption, setSelectedOption] = useState<Option | undefined>();

  // get addresses in this postcode & gss_code (aka local planning authority)
  //    if gss_code is null, eg for team "opensystemslab", then ignore it in where filter https://stackoverflow.com/a/55809891
  const { data } = useQuery(
    gql`
      query FindAddress($postcode: String = "", $gss_code: String) {
        addresses(
          where: {
            postcode: { _eq: $postcode }
            _or: [
              { gss_code: { _eq: $gss_code } }
              { gss_code: { _eq: "" } }
              { gss_code: { _is_null: true } }
            ]
          }
        ) {
          uprn
          town
          y
          x
          street
          sao
          postcode
          pao
          organisation
          blpu_code
          latitude
          longitude
          single_line_address
        }
      }
    `,
    {
      // XXX: temporarily read addresses from staging db if it's a pizza
      client: window.location.host.endsWith(".pizza")
        ? addressesClientForPizzas
        : client,
      skip: !Boolean(sanitizedPostcode),
      variables: {
        postcode: sanitizedPostcode,
        gss_code: props.gssCode,
      },
    }
  );

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
        <FormInput
          placeholder="Enter the postcode of the property"
          value={postcode || ""}
          onChange={(e: any) => {
            // XXX: If you press a key on the keyboard, you expect something to show up on the screen,
            //      so this code attempts to validate postcodes without blocking any characters.
            const input = e.target.value;
            if (parse(input.trim()).valid) {
              setSanitizedPostcode(toNormalised(input.trim()));
              setPostcode(toNormalised(input.trim()));
            } else {
              setSanitizedPostcode(null);
              setPostcode(input.toUpperCase());
            }
          }}
          errorMessage={
            data?.addresses?.length === 0
              ? "This postcode is not in your local planning authority"
              : ""
          }
        />
        {Boolean(data?.addresses?.length) && (
          <Autocomplete
            options={data.addresses
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
            getOptionSelected={(option: Option) => Boolean(option.title)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Address"
                variant="outlined"
                style={{ marginTop: 20 }}
                autoFocus
              />
            )}
            onChange={(event, selectedOption) => {
              if (selectedOption) {
                setSelectedOption(selectedOption);
              }
            }}
          />
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
    propertyConstraints,
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
          reason: "Inaccurate property location",
          property: propertyDetails,
          constraints: propertyConstraints,
        });
      }
      handleSubmit?.();
    },
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <Box className={styles.map}>
        {/* @ts-ignore */}
        <my-map
          zoom={19.5}
          latitude={lat}
          longitude={lng}
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          hideResetControl
          showFeaturesAtPoint
          osFeaturesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_FEATURES_KEY}
          featureColor={teamColor}
          featureFill
          ariaLabel="A static map centered on your address input, showing the Ordnance Survey basemap features."
        />
      </Box>
      <Box mb={6}>
        {propertyDetails.map(({ heading, detail }: any) => (
          <Box className={styles.propertyDetail} key={heading}>
            <Box fontWeight={700} flex={"0 0 35%"} py={1}>
              {heading}
            </Box>
            <Box flexGrow={1} py={1}>
              {detail}
            </Box>
          </Box>
        ))}
      </Box>
      <PropertyConstraints constraintsData={propertyConstraints} />
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

function PropertyConstraints({ constraintsData }: any) {
  const { title, description, constraints } = constraintsData;

  // Order constraints so that { value: true } ones come first
  constraints.sort(function (a: any, b: any) {
    return b.value - a.value;
  });

  const visibleConstraints = constraints.map((con: any) => (
    <Constraint key={con.text} color={con.color || ""}>
      {ReactHtmlParser(con.text)}
    </Constraint>
  ));

  return (
    <Box mb={3}>
      <Box pb={2}>
        <Typography variant="h3" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {description}
        </Typography>
      </Box>
      {visibleConstraints.length > 0 ? (
        visibleConstraints
      ) : (
        <DelayedLoadingIndicator
          msDelayBeforeVisible={0}
          text="Fetching constraints..."
        />
      )}
    </Box>
  );
}

function Constraint({ children, color, ...props }: any) {
  const classes = useClasses();
  const theme = useTheme();
  return (
    <Box
      className={classes.constraint}
      bgcolor={color ? color : "background.paper"}
      color={
        color
          ? theme.palette.getContrastText(color)
          : theme.palette.text.primary
      }
      {...props}
    >
      {children}
    </Box>
  );
}
