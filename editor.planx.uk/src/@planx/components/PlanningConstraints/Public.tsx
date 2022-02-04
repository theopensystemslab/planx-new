import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ReactHtmlParser from "react-html-parser";
import { useCurrentRoute } from "react-navi";
import useSWR from "swr";
import CollapsibleInput from "ui/CollapsibleInput";

import type { PlanningConstraints } from "./model";

type Props = PublicProps<PlanningConstraints>;

export default Component;

function Component(props: Props) {
  const [x, y, siteBoundary] = useStore((state) => [
    state.computePassport().data?._address.x,
    state.computePassport().data?._address.y,
    state.computePassport().data?.["property.boundary.site"],
  ]);
  const route = useCurrentRoute();
  const team = route?.data?.team ?? route.data.mountpath.split("/")[1];

  // Get the coordinates of the site boundary drawing if they exist, fallback on x & y if file was uploaded
  // Coords should match Esri's "rings" type https://developers.arcgis.com/javascript/3/jsapi/polygon-amd.html#rings
  const coordinates: number[][][] = siteBoundary?.geometry?.coordinates || [];

  const {
    data: constraints,
    error,
    mutate,
    isValidating,
  } = useSWR(
    () =>
      x && y
        ? `${
            process.env.REACT_APP_API_URL
          }/gis/${team}?x=${x}&y=${y}&siteBoundary=${JSON.stringify(
            coordinates
          )}&version=1`
        : null,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 500,
      errorRetryCount: 1,
    }
  );

  return (
    <>
      {!isValidating && constraints ? (
        <PlanningConstraintsInformation
          title={props.title}
          description={props.description || ""}
          fn={props.fn}
          constraints={constraints}
          handleSubmit={(feedback?: string) => {
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
            };

            props.handleSubmit?.({
              data: passportData,
            });
          }}
          refreshConstraints={() => mutate()}
        />
      ) : (
        <Card handleSubmit={props.handleSubmit} isValid>
          <QuestionHeader
            title={props.title}
            description={props.description || ""}
          />
          <DelayedLoadingIndicator
            msDelayBeforeVisible={0}
            text="Fetching data..."
          />
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
      "border-style": "none",
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

function PlanningConstraintsInformation(props: any) {
  const { title, description, constraints, handleSubmit, refreshConstraints } =
    props;
  const formik = useFormik({
    initialValues: {
      feedback: "",
    },
    onSubmit: (values) => {
      if (values.feedback) {
        submitFeedback(values.feedback, {
          reason: "Inaccurate planning constraints",
          constraints: constraints,
        });
      }
      handleSubmit?.();
    },
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader title={title} description={description} />
      <ConstraintsList
        data={constraints}
        refreshConstraints={refreshConstraints}
      />
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

function ConstraintsList({ data, refreshConstraints }: any) {
  const classes = useClasses();
  const constraints = Object.values(data).filter(({ text }: any) => text);

  // Order constraints so that { value: true } ones come first
  constraints.sort(function (a: any, b: any) {
    return b.value - a.value;
  });

  const visibleConstraints = constraints.map((con: any) => (
    <Constraint
      key={con.text}
      color={con.color}
      style={{ fontWeight: con.value ? 700 : 500 }}
    >
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
        <div className={classes.errorSummary}>
          <Typography variant="h5" component="h2" gutterBottom>
            Failed to fetch data
          </Typography>
          <Typography variant="body2">
            Click the link below to try to fetch again. If you continue without
            fetching data, you may be asked to answer questions about planning
            constraints affecting this property later in the application.
          </Typography>
          <button onClick={refreshConstraints}>Try again</button>
        </div>
      )}
    </Box>
  );
}

function Constraint({ children, color, ...props }: any) {
  const classes = useClasses();
  const theme = useTheme();
  return (
    <ListItem dense disableGutters>
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
    </ListItem>
  );
}
