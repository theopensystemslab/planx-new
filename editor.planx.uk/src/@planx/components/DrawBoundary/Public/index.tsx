import "./map.css";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { makeData } from "@planx/components/shared/utils";
import type { PublicProps } from "@planx/components/ui";
import turfArea from "@turf/area";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";

import type { DrawBoundary } from "../model";
import { DEFAULT_TITLE, DEFAULT_TITLE_FOR_UPLOADING } from "../model";
import Map from "./Map";
import Upload from "./Upload";

export type Props = PublicProps<DrawBoundary>;

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
  uploadInstead: {
    textAlign: "right",
    fontSize: "small",
    marginTop: theme.spacing(1),
    "& a": {
      color: theme.palette.text.secondary,
      cursor: "pointer",
      padding: theme.spacing(2),
    },
  },
}));

export default function Component(props: Props) {
  const [page, setPage] = useState<"draw" | "upload">("draw");
  const passport = useStore((state) => state.computePassport());
  const classes = useClasses();
  const [boundary, setBoundary] = useState<Boundary>();
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    setUrl(undefined);
    setBoundary(undefined);
  }, [page, setBoundary, setUrl]);
  const area = boundary !== undefined ? round(turfArea(boundary)) : 0;

  return (
    <Card handleSubmit={handleSubmit} isValid={Boolean(boundary || url)}>
      {getBody()}
    </Card>
  );

  function getBody() {
    if (page === "draw") {
      return (
        <>
          <QuestionHeader
            title={props.title ?? DEFAULT_TITLE}
            description={props.description}
          />
          <Box className={classes.map}>
            <Map
              zoom={18}
              lat={Number(passport?.data?._address?.value.latitude)}
              lng={Number(passport?.data?._address?.value.longitude)}
              setBoundary={setBoundary}
            />
          </Box>
          <p className={classes.uploadInstead}>
            <a onClick={() => setPage("upload")}>Upload a PDF instead</a>
          </p>
          <p>
            The boundary you have drawn has an area of{" "}
            <strong>{area ?? 0} m²</strong>
          </p>
        </>
      );
    } else if (page === "upload") {
      return (
        <div>
          <QuestionHeader
            title={props.titleForUploading ?? DEFAULT_TITLE_FOR_UPLOADING}
            description={props.descriptionForUploading}
          />
          <Upload setUrl={setUrl} />
          <p className={classes.uploadInstead}>
            <a onClick={() => setPage("draw")}>
              Draw the boundary on a map instead
            </a>
          </p>
        </div>
      );
    }
  }

  function handleSubmit() {
    const data = (() => {
      const ob: Store.userData["data"] = {};
      if (props.dataFieldBoundary) {
        ob[props.dataFieldBoundary] = boundary;
      }
      if (props.dataFieldArea) {
        ob[props.dataFieldArea] = area;
      }
      return Object.keys(ob).length > 0 ? ob : undefined;
    })();

    props.handleSubmit?.(makeData(props, data));
  }
}

function round(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export type Boundary = undefined | Geometry;
