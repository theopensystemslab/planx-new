import "./map.css";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { visuallyHidden } from "@material-ui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";

import { DEFAULT_PASSPORT_AREA_KEY, DrawBoundary } from "../model";
import {
  DEFAULT_TITLE,
  DEFAULT_TITLE_FOR_UPLOADING,
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
  },
}));

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.dataFieldBoundary];
  const previousArea =
    props.previouslySubmittedData?.data?.[
      props.dataFieldArea || DEFAULT_PASSPORT_AREA_KEY
    ];
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

    // XXX: querySelector("my-map") isn't reliable if there's a second hidden map rendered
    const map: any = document.getElementById("visible-map");

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
      isValid={Boolean(boundary || selectedFile?.url)}
    >
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
            <div className={classes.hidden}>
              {/*

              XXX: THIS IS A HACK AND I'M NOT SORRY 

              When clicking the "back" button after having drawn a boundary, for some obscure reason the boundary would be duplicated, showing two shapes on top of each other.  Each time you would press "Continue" then "Back" again, a new identical shape would be added on top of the previous ones.

              For some obscure reason, it seems the state of the shapes being drawn is shared between all instances of theopensystemslab/map in a page. To be more precise, it's openlayers/openlayers that has this bug.

              You can repro this by having two maps side by side. Even when not passing down any shared state through props (e.g. drawGeojsonData), the drawing on one map will be synchronously replicated to the other map. So yeah I *think* this has something to do with our back-button bug.

              For some even more obscure reason, having two maps on the page fixes the back-button bug!! WHYYYYYYY! I have no idea. And I'm sorry. And I'm confused. And it's Friday. This is beyond me. I'll put this second map hidden under `display: none` and call it a day. As far as I can tell, it works perfectly. 

              Cheers,
              Gunar

              @ts-ignore */}
              <my-map drawMode zoom={19} />
            </div>
            <p style={visuallyHidden}>
              An interactive map centered on your address, with a red pointer to
              draw your site outline. Click to place points and connect the
              lines to make your site. Once you've closed the site shape, click
              and drag the lines to modify it. If you cannot draw, you can
              upload a location plan file using the link below.
            </p>
            {/* @ts-ignore */}
            <my-map
              id="visible-map"
              drawMode
              drawPointer="dot"
              drawGeojsonData={JSON.stringify(boundary)}
              zoom={19}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
            />
          </Box>
          <div className={classes.uploadInstead}>
            <button onClick={() => setPage("upload")}>
              Upload a location plan instead
            </button>
          </div>
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
          <Upload setFile={setSelectedFile} initialFile={selectedFile} />
          <div className={classes.uploadInstead}>
            <button onClick={() => setPage("draw")}>
              Draw the boundary on a map instead
            </button>
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
        [props.dataFieldArea || DEFAULT_PASSPORT_AREA_KEY]:
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
