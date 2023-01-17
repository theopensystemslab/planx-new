import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ReactHtmlParser from "react-html-parser";
import { useCurrentRoute } from "react-navi";
import useSWR from "swr";
import CollapsibleInput from "ui/CollapsibleInput";
import { stringify } from "wkt";

import type { PlanningConstraints } from "./model";

type Props = PublicProps<PlanningConstraints>;

export default Component;

function Component(props: Props) {
  const [x, y, longitude, latitude, siteBoundary] = useStore((state) => [
    state.computePassport().data?._address?.x,
    state.computePassport().data?._address?.y,
    state.computePassport().data?._address?.longitude,
    state.computePassport().data?._address?.latitude,
    state.computePassport().data?.["property.boundary.site"],
  ]);
  const route = useCurrentRoute();
  const team = route?.data?.team ?? route.data.mountpath.split("/")[1];

  // Get current query parameters (eg ?analytics=false&sessionId=XXX) to determine if we should audit this response
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const classes = useClasses();

  // Get the coordinates of the site boundary drawing if they exist, fallback on x & y if file was uploaded
  // Coords should match Esri's "rings" type https://developers.arcgis.com/javascript/3/jsapi/polygon-amd.html#rings
  const coordinates: number[][][] = siteBoundary?.geometry?.coordinates || [];

  // Get the WKT representation of the site boundary drawing or address point to pass to Digital Land, when applicable
  const wktPoint: string = `POINT(${longitude} ${latitude})`;
  const wktPolygon: string | undefined =
    siteBoundary && stringify(siteBoundary);

  // Configure which planx teams should query Digital Land (or continue to use custom GIS) and set URL params accordingly
  //   In future, Digital Land will theoretically support any UK address and this list won't be necessary, but data collection still limited to select councils!
  const digitalLandOrganisations: string[] = [
    "opensystemslab",
    "buckinghamshire",
    "canterbury",
    "doncaster",
    "lambeth",
    "medway",
    "newcastle",
    "southwark",
  ];

  const digitalLandParams: Record<string, string> = {
    geom: wktPolygon || wktPoint,
    ...params,
  };
  const customGisParams: Record<string, any> = {
    x: x,
    y: y,
    siteBoundary: JSON.stringify(coordinates),
    version: 1,
  };

  const root: string = `${process.env.REACT_APP_API_URL}/gis/${team}?`;
  const teamGisEndpoint: string =
    root +
    new URLSearchParams(
      digitalLandOrganisations.includes(team)
        ? digitalLandParams
        : customGisParams
    ).toString();

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, error, mutate, isValidating } = useSWR(
    () => (x && y && latitude && longitude ? teamGisEndpoint : null),
    fetcher,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  // XXX handle both/either Digital Land response and custom GIS hookup responses
  const constraints: Record<string, any> | undefined =
    data?.constraints || data;

  return (
    <>
      {!isValidating && constraints ? (
        <PlanningConstraintsInformation
          title={props.title}
          description={props.description || ""}
          fn={props.fn}
          constraints={constraints}
          previousFeedback={props.previouslySubmittedData?.feedback}
          handleSubmit={(values: { feedback?: string }) => {
            const _nots: any = {};
            const newPassportData: any = {};

            Object.entries(constraints).forEach(([key, data]: any) => {
              if (data.value) {
                newPassportData[props.fn] ||= [];
                newPassportData[props.fn].push(key);
              } else {
                _nots[props.fn] ||= [];
                _nots[props.fn].push(key);
              }
            });

            const passportData = {
              _nots,
              ...newPassportData,
              ...{ digitalLandRequest: data?.url || "" },
            };

            props.handleSubmit?.({
              ...values,
              data: passportData,
            });
          }}
          refreshConstraints={() => mutate()}
          sourcedFromDigitalLand={digitalLandOrganisations.includes(team)}
        />
      ) : (
        <Card handleSubmit={props.handleSubmit} isValid>
          <QuestionHeader
            title={props.title}
            description={props.description || ""}
          />
          {x && y && longitude && latitude ? (
            <DelayedLoadingIndicator text="Fetching data..." />
          ) : (
            <div className={classes.errorSummary} role="status">
              <Typography variant="h5" component="h2" gutterBottom>
                Invalid graph
              </Typography>
              <Typography variant="body2">
                Edit this flow so that "Planning constraints" is positioned
                after "Find property"; an address or site boundary drawing is
                required to fetch data.
              </Typography>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

const useClasses = makeStyles((theme) => ({
  constraint: {
    borderLeft: `3px solid rgba(0,0,0,0.3)`,
    padding: theme.spacing(1, 1.5),
    width: `100vw`,
  },
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
  sourcedFrom: {
    paddingBottom: "1em",
  },
}));

function PlanningConstraintsInformation(props: any) {
  const classes = useClasses();
  const {
    title,
    description,
    constraints,
    handleSubmit,
    refreshConstraints,
    sourcedFromDigitalLand,
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
          "Inaccurate planning constraints",
          constraints
        );
      }
      handleSubmit?.(values);
    },
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <ConstraintsList
        data={constraints}
        refreshConstraints={refreshConstraints}
      />
      {sourcedFromDigitalLand && (
        <Box className={classes.sourcedFrom}>
          <Typography variant="body2" color="inherit">
            Sourced from Department for Levelling Up, Housing & Communities.
          </Typography>
        </Box>
      )}
      <Box color="text.secondary" textAlign="right">
        <CollapsibleInput
          name="feedback"
          handleChange={formik.handleChange}
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

function ConstraintsList({ data, refreshConstraints }: any) {
  const classes = useClasses();
  const error = data.error || undefined;
  const constraints = Object.values(data).filter(({ text }: any) => text);

  // Order constraints so that { value: true } ones come first
  constraints.sort(function (a: any, b: any) {
    return b.value - a.value;
  });

  const visibleConstraints = constraints.map((con: any) => (
    <Constraint key={con.text} style={{ fontWeight: con.value ? 700 : 500 }}>
      {ReactHtmlParser(con.text)}
    </Constraint>
  ));

  // Display constraints for valid teams, or message if unsupported local authority (eg api returned '{}')
  return (
    <Box mb={3}>
      {visibleConstraints.length > 0 ? (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            This property
          </Typography>
          <List dense disablePadding>
            {visibleConstraints}
          </List>
        </>
      ) : (
        <div className={classes.errorSummary} role="status">
          <Typography variant="h5" component="h2" gutterBottom>
            No information available
          </Typography>
          {error &&
          typeof error === "string" &&
          error.endsWith("local authority") ? (
            <Typography variant="body2">{capitalize(error)}</Typography>
          ) : (
            <>
              <Typography variant="body2">
                We couldn't find any information about your property. Click
                search again to try again. You can continue your application
                without this information but it might mean we ask additional
                questions about your project.
              </Typography>
              <button onClick={refreshConstraints}>Search again</button>
            </>
          )}
        </div>
      )}
    </Box>
  );
}

function Constraint({ children, ...props }: any) {
  const classes = useClasses();
  const theme = useTheme();
  return (
    <ListItem dense disableGutters>
      <Box
        className={classes.constraint}
        bgcolor="background.paper"
        color={theme.palette.text.primary}
        {...props}
      >
        {children}
      </Box>
    </ListItem>
  );
}
