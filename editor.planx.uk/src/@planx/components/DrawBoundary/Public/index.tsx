import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";
import React, { useEffect, useRef, useState } from "react";

import {
  DrawBoundary,
  PASSPORT_UPLOAD_KEY,
  PASSPORT_UPLOADED_FILE_KEY,
} from "../model";
import Upload, { FileUpload } from "./Upload";

export type Props = PublicProps<DrawBoundary>;
export type SelectedFile = FileUpload;

interface MapContainerProps {
  environment: PreviewEnvironment;
}

const MapContainer = styled(Box)<MapContainerProps>(
  ({ theme, environment }) => ({
    padding: theme.spacing(1, 0),
    width: "100%",
    height: "50vh",
    // Only increase map size in Preview & Unpublished routes
    [theme.breakpoints.up("md")]:
      environment === "standalone"
        ? {
            height: "70vh",
            minWidth: "65vw",
          }
        : {},
    "& my-map": {
      width: "100%",
      height: "100%",
    },
  })
);

const AlternateOption = styled("div")(({ theme }) => ({
  textAlign: "right",
  marginTop: theme.spacing(1),
}));

const AlternateOptionButton = styled(Button)(({ theme }) => ({
  background: "none",
  borderStyle: "none",
  color: theme.palette.text.primary,
  cursor: "pointer",
  fontSize: "medium",
  padding: theme.spacing(2),
  "& :hover": {
    backgroundColor: theme.palette.background.paper,
  },
  "& :disabled": {
    color: theme.palette.text.disabled,
  },
}));

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.dataFieldBoundary];
  const previousArea =
    props.previouslySubmittedData?.data?.[props.dataFieldArea];
  const previousFile = props.previouslySubmittedData?.data?.cachedFile;
  const startPage = previousFile ? "upload" : "draw";
  const [page, setPage] = useState<"draw" | "upload">(startPage);
  const passport = useStore((state) => state.computePassport());
  const [boundary, setBoundary] = useState<Boundary>(previousBoundary);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | undefined>(
    previousFile
  );
  const [area, setArea] = useState<number | undefined>(previousArea);
  const environment = useStore((state) => state.previewEnvironment);

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
          <MapContainer environment={environment}>
            <p style={visuallyHidden}>
              An interactive map centred on your address, with a red pointer to
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
              drawPointer="dot"
              // drawPointer="crosshair"
              drawGeojsonData={JSON.stringify(boundary)}
              zoom={20}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              showMarker
              markerLatitude={Number(passport?.data?._address?.latitude)}
              markerLongitude={Number(passport?.data?._address?.longitude)}
              osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
            />
            {!props.hideFileUpload && (
              <AlternateOption>
                <AlternateOptionButton
                  data-testid="upload-file-button"
                  onClick={() => setPage("upload")}
                  disabled={Boolean(boundary)}
                >
                  Upload a location plan instead
                </AlternateOptionButton>
              </AlternateOption>
            )}
          </MapContainer>
          <p>
            The site outline you have drawn is{" "}
            <strong>{area?.toLocaleString("en-GB") ?? 0} m²</strong>
          </p>
        </>
      );
    } else if (page === "upload") {
      return (
        <>
          <QuestionHeader
            title={props.titleForUploading}
            description={props.descriptionForUploading}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <Upload setFile={setSelectedFile} initialFile={selectedFile} />
          <AlternateOption>
            <AlternateOptionButton
              onClick={() => setPage("draw")}
              disabled={Boolean(selectedFile?.url)}
            >
              Draw the boundary on a map instead
            </AlternateOptionButton>
          </AlternateOption>
        </>
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
        [`${props.dataFieldArea}.hectares`]:
          boundary && area && props.dataFieldBoundary
            ? area / 10000
            : undefined,
        [propsDataFieldUrl]:
          selectedFile?.url && propsDataFieldUrl
            ? selectedFile?.url
            : undefined,
        [PASSPORT_UPLOADED_FILE_KEY]:
          selectedFile && propsDataFieldUrl ? selectedFile : undefined,
        cachedFile: selectedFile
          ? {
              ...selectedFile,
              file: {
                path: selectedFile.file.path,
                size: selectedFile.file.size,
                type: selectedFile.file.type,
              },
            }
          : undefined,
      };
    })();

    props.handleSubmit?.({ data });
  }
}

export type Boundary = undefined | Geometry;
