import "./map.css";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";

import {
  DrawBoundary,
  PASSPORT_UPLOAD_KEY,
  PASSPORT_UPLOADED_FILE_KEY,
} from "../model";
import Upload, { FileUpload } from "./Upload";

export type Props = PublicProps<DrawBoundary>;
export type SelectedFile = FileUpload;

const useClasses = makeStyles((theme) => ({
  map: {
    padding: theme.spacing(1, 0),
  },
  hidden: { display: "none" },
  uploadInstead: {
    textAlign: "right",
    marginTop: theme.spacing(1),
    "& button": {
      background: "none",
      "border-style": "none",
      color: theme.palette.text.primary,
      cursor: "pointer",
      fontSize: "medium",
      padding: theme.spacing(2),
    },
    "& button:hover": {
      backgroundColor: theme.palette.background.paper,
    },
    "& button:disabled": {
      color: theme.palette.text.disabled,
    },
  },
}));

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.dataFieldBoundary];
  const previousArea =
    props.previouslySubmittedData?.data?.[props.dataFieldArea];
  const previousFile =
    props.previouslySubmittedData?.data?.[PASSPORT_UPLOADED_FILE_KEY];
  const startPage = previousFile ? "upload" : "draw";
  const [page, setPage] = useState<"draw" | "upload">(startPage);
  const passport = useStore((state) => state.computePassport());
  const classes = useClasses();
  const [boundary, setBoundary] = useState<Boundary>(previousBoundary);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | undefined>(
    previousFile
  );
  const [area, setArea] = useState<number | undefined>(previousArea);

  useEffect(() => {
    if (isMounted.current) setSelectedFile(undefined);
    isMounted.current = true;

    const areaChangeHandler = ({ detail }: { detail: string }) => {
      const numberString = detail.split(" ")[0];
      const area = Number(numberString);
      setArea(area);
    };

    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson.features) {
        // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
        setBoundary(geojson.features[0]);
      } else {
        // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set boundary to undefined
        setBoundary(undefined);
      }
    };

    const map: any = document.getElementById("draw-boundary-map");

    map?.addEventListener("areaChange", areaChangeHandler);
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("areaChange", areaChangeHandler);
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [page, setArea, setBoundary, setSelectedFile]);

  return (
    <Card
      handleSubmit={handleSubmit}
      isValid={
        props.hideFileUpload ? true : Boolean(boundary || selectedFile?.url)
      }
    >
      {getBody()}
    </Card>
  );

  function getBody() {
    if (page === "draw") {
      return (
        <>
          <QuestionHeader
            title={props.title}
            description={props.description}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <Box className={classes.map}>
            <p style={visuallyHidden}>
              An interactive map centered on your address, with a red pointer to
              draw your site outline. Click to place points and connect the
              lines to make your site. Once you've closed the site shape, click
              and drag the lines to modify it.
            </p>
            {!props.hideFileUpload && (
              <p style={visuallyHidden}>
                If you cannot draw, you can upload a location plan file using
                the link below.
              </p>
            )}
            {/* @ts-ignore */}
            <my-map
              id="draw-boundary-map"
              drawMode
              drawPointer="crosshair"
              drawGeojsonData={JSON.stringify(boundary)}
              zoom={20}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
            />
          </Box>
          {!props.hideFileUpload && (
            <div className={classes.uploadInstead}>
              <Button
                data-testid="upload-file-button"
                onClick={() => setPage("upload")}
                disabled={Boolean(boundary)}
              >
                Upload a location plan instead
              </Button>
            </div>
          )}
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
            title={props.titleForUploading}
            description={props.descriptionForUploading}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <Upload setFile={setSelectedFile} initialFile={selectedFile} />
          <div className={classes.uploadInstead}>
            <Button
              onClick={() => setPage("draw")}
              disabled={Boolean(selectedFile?.url)}
            >
              Draw the boundary on a map instead
            </Button>
          </div>
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
          boundary && props.dataFieldBoundary ? area : undefined,
        [propsDataFieldUrl]:
          selectedFile?.url && propsDataFieldUrl
            ? selectedFile?.url
            : undefined,
        [PASSPORT_UPLOADED_FILE_KEY]:
          selectedFile && propsDataFieldUrl ? selectedFile : undefined,
      };
    })();

    props.handleSubmit?.({ data });
  }
}

export type Boundary = undefined | Geometry;
