import "./map.css";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Card from "@planx/components/shared/Preview/Card";
import FormInput from "@planx/components/shared/Preview/FormInput";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import turfArea from "@turf/area";
import type { Geometry } from "@turf/helpers";
import produce from "immer";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useState } from "react";

import type { DrawBoundary } from "../model";
import Map from "./Map";

export type Props = PublicProps<DrawBoundary>;

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
}));

export default Component;

function Component(props: Props) {
  const [passport, mutatePassport] = useStore((state) => [
    state.passport,
    state.mutatePassport,
  ]);
  const styles = useClasses();
  const [boundary, setBoundary] = useState<Boundary>();
  const area = boundary !== undefined ? round(turfArea(boundary)) : 0;

  return (
    <Card handleSubmit={handleSubmit} isValid={Boolean(boundary)}>
      <QuestionHeader title={props.title} description={props.description} />
      <Box className={styles.map}>
        <Map
          zoom={18}
          lat={Number(passport?.info?.latitude)}
          lng={Number(passport?.info?.longitude)}
          setBoundary={setBoundary}
        />
      </Box>
      <div>
        <h3>Area selected:</h3>
        <p>{area ?? 0} m2</p>
      </div>
    </Card>
  );

  function handleSubmit() {
    mutatePassport((draft) => {
      draft.data[props.dataFieldBoundary] = boundary;
      draft.data[props.dataFieldArea] = area;
    });
    props.handleSubmit && props.handleSubmit();
  }
}

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export type Boundary = undefined | Geometry;
