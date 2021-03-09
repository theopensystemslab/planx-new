import "./map.css";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import turfArea from "@turf/area";
import type { Geometry } from "@turf/helpers";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";

import type { DrawBoundary } from "../model";
import Map from "./Map";
import Upload from "./Upload";

export type Props = PublicProps<DrawBoundary>;

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
}));

export default function Component(props: Props) {
  const [passport, mutatePassport] = useStore((state) => [
    state.passport,
    state.mutatePassport,
  ]);
  const classes = useClasses();
  const [boundary, setBoundary] = useState<Boundary>();
  const [url, setUrl] = useState<String | undefined>();
  const area = boundary !== undefined ? round(turfArea(boundary)) : 0;

  return (
    <Card handleSubmit={handleSubmit} isValid={Boolean(boundary || url)}>
      <QuestionHeader
        title={props.title ?? "Draw the boundary of the property"}
        description={props.description}
      />
      <Box className={classes.map}>
        <Map
          zoom={18}
          lat={Number(passport?.info?.latitude)}
          lng={Number(passport?.info?.longitude)}
          setBoundary={setBoundary}
        />
      </Box>
      <div>
        <p>
          <strong>Area selected:</strong> {area ?? 0} m²
        </p>
      </div>
      <hr />
      <div>
        <h3>Alternatively, upload the PDF location plan:</h3>
        <Upload setUrl={setUrl} />
      </div>
    </Card>
  );

  function handleSubmit() {
    mutatePassport((draft) => {
      if (props.dataFieldBoundary) {
        draft.data[props.dataFieldBoundary] = boundary;
      }
      if (props.dataFieldArea) {
        draft.data[props.dataFieldArea] = area;
      }
    });
    props.handleSubmit && props.handleSubmit([url]);
  }
}

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export type Boundary = undefined | Geometry;
