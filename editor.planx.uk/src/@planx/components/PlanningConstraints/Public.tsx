import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ReactHtmlParser from "react-html-parser";
import { useCurrentRoute } from "react-navi";
import useSWR from "swr";

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

  // If we don't have a site boundary (aka a file was uploaded), then query using the address point
  const { data: constraints } = useSWR(
    () =>
      x & y
        ? `${process.env.REACT_APP_API_URL}/gis/${team}?x=${x}&y=${y}&version=1`
        : null,
    {
      shouldRetryOnError: true,
      errorRetryInterval: 1000,
      errorRetryCount: 3,
    }
  );

  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        title={props.title}
        description={props.description || ""}
      />
      {Object.keys(constraints).length > 0 
        ? <PropertyConstraints data={constraints} />
        : <DelayedLoadingIndicator msDelayBeforeVisible={0} text="Fetching data..." />
      }
    </Card>
  );
}

const useClasses = makeStyles((theme) => ({
  constraint: {
    borderLeft: `3px solid rgba(0,0,0,0.3)`,
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(0.5),
  },
}));

function PropertyConstraints({ data }: any) {
  const constraints = Object.values(data).filter(
    ({ text }: any) => text
  );

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
      {visibleConstraints}
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
