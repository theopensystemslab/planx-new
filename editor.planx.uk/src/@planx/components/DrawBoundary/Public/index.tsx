import "./map.css";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";

import type { DrawBoundary } from "../model";
import {
  DEFAULT_TITLE,
  DEFAULT_TITLE_FOR_UPLOADING,
  PASSPORT_UPLOAD_KEY,
} from "../model";
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
  const [area, setArea] = useState<number | undefined>();

  useEffect(() => {
    setUrl(undefined);

    const areaChangeHandler = ({ detail }: { detail: string }) => {
      const numberString = detail.split(" ")[0];
      const area = Number(numberString);
      setArea(area);
    };

    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
      setBoundary(geojson.features[0]);
    };

    const map = document.querySelector("my-map");
    map?.addEventListener("areaChange", areaChangeHandler);
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("areaChange", areaChangeHandler);
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [page, setArea, setBoundary, setUrl]);

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
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <Box className={classes.map}>
            {/* @ts-ignore */}
            <my-map
              drawMode
              zoom={19}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
            />
          </Box>
          <p className={classes.uploadInstead}>
            <a onClick={() => setPage("upload")}>Upload a file instead</a>
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
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
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
    const data: Store.userData["data"] = (() => {
      // XXX: we haven't added a custom upload field name in the editor yet
      const propsDataFieldUrl = PASSPORT_UPLOAD_KEY;

      // set userData depending if user draws boundary or uploads file
      return {
        [props.dataFieldBoundary]:
          boundary && props.dataFieldBoundary ? boundary : undefined,
        [props.dataFieldArea]:
          boundary && props.dataFieldBoundary && props.dataFieldArea
            ? area
            : undefined,
        [propsDataFieldUrl]: url && propsDataFieldUrl ? url : undefined,
      };
    })();

    props.handleSubmit?.({ data });
  }
}

export type Boundary = undefined | Geometry;
