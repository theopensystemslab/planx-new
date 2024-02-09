import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { FileUploadSlot } from "@planx/components/FileUpload/Public";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import Card from "@planx/components/shared/Preview/Card";
import {
  MapContainer,
  MapFooter,
} from "@planx/components/shared/Preview/MapContainer";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PrivateFileUpload } from "@planx/components/shared/PrivateFileUpload/PrivateFileUpload";
import { squareMetresToHectares } from "@planx/components/shared/utils";
import type { PublicProps } from "@planx/components/ui";
import buffer from "@turf/buffer";
import { type Feature, point } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FullWidthWrapper from "ui/public/FullWidthWrapper";

import {
  DrawBoundary,
  DrawBoundaryUserAction,
  PASSPORT_COMPONENT_ACTION_KEY,
  PASSPORT_UPLOAD_KEY,
} from "../model";

export type Props = PublicProps<DrawBoundary>;

export type Boundary = Feature | undefined;

// Buffer applied to the address point to clip this map extent
//   and applied to the site boundary and written to the passport to later clip the map extent in overview documents
const BUFFER_IN_METERS = 100;

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const passport = useStore((state) => state.computePassport());

  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.dataFieldBoundary] ||
    passport.data?.["property.boundary.title"];
  const previousArea =
    props.previouslySubmittedData?.data?.[props.dataFieldArea] ||
    passport.data?.["property.boundary.title.area"];
  const [boundary, setBoundary] = useState<Boundary>(previousBoundary);
  const [area, setArea] = useState<number | undefined>(previousArea);

  const previousFile =
    props.previouslySubmittedData?.data?.[PASSPORT_UPLOAD_KEY];
  const startPage = previousFile ? "upload" : "draw";
  const [page, setPage] = useState<"draw" | "upload">(startPage);
  const [slots, setSlots] = useState<FileUploadSlot[]>(previousFile ?? []);

  const addressPoint =
    passport?.data?._address?.longitude &&
    passport?.data?._address?.latitude &&
    point([
      Number(passport?.data?._address?.longitude),
      Number(passport?.data?._address?.latitude),
    ]);
  const environment = useStore((state) => state.previewEnvironment);

  useEffect(() => {
    if (isMounted.current) setSlots([]);
    isMounted.current = true;

    const areaChangeHandler = ({ detail }: { detail: string }) => {
      const numberString = detail.split(" ")[0];
      const area = Number(numberString);
      setArea(area);
    };

    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
        setBoundary(geojson["EPSG:3857"].features[0]);
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
  }, [page, setArea, setBoundary, setSlots]);

  return (
    <Card
      handleSubmit={() => {
        const newPassportData: Store.userData["data"] = {};

        // Used the map
        if (boundary && props.dataFieldBoundary) {
          newPassportData[props.dataFieldBoundary] = boundary;
          newPassportData[`${props.dataFieldBoundary}.buffered`] = buffer(
            boundary,
            BUFFER_IN_METERS,
            { units: "meters" },
          );

          if (area && props.dataFieldArea) {
            newPassportData[props.dataFieldArea] = area;
            newPassportData[`${props.dataFieldArea}.hectares`] =
              squareMetresToHectares(area);
          }

          // Track the type of map interaction
          if (
            boundary?.geometry ===
            passport.data?.["property.boundary.title"]?.geometry
          ) {
            newPassportData[PASSPORT_COMPONENT_ACTION_KEY] =
              DrawBoundaryUserAction.Accept;
          } else if (boundary?.properties?.dataset === "title-boundary") {
            newPassportData[PASSPORT_COMPONENT_ACTION_KEY] =
              DrawBoundaryUserAction.Amend;
          } else {
            newPassportData[PASSPORT_COMPONENT_ACTION_KEY] =
              DrawBoundaryUserAction.Draw;
          }
        }

        // Uploaded a file
        if (slots.length) {
          newPassportData[PASSPORT_UPLOAD_KEY] = slots;
          newPassportData[PASSPORT_COMPONENT_ACTION_KEY] =
            DrawBoundaryUserAction.Upload;

          // Track as requested file
          const { required, recommended, optional } = useStore
            .getState()
            .requestedFiles();

          newPassportData[PASSPORT_REQUESTED_FILES_KEY] = {
            required: [...required, PASSPORT_UPLOAD_KEY],
            recommended,
            optional,
          };
        }

        props.handleSubmit?.({ data: { ...newPassportData } });
      }}
      isValid={props.hideFileUpload ? true : Boolean(boundary || slots[0]?.url)}
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
          <FullWidthWrapper>
            <MapContainer environment={environment} size="large">
              <p style={visuallyHidden}>
                An interactive map centred on your address, pre-populated with a
                red boundary that includes the entire property, using
                information from the Land Registry. You can accept this boundary
                as your location plan by continuing, you can amend it by
                clicking and dragging the points, or you can erase it by
                clicking the reset button and draw a new custom boundary.
              </p>
              {!props.hideFileUpload && (
                <p style={visuallyHidden}>
                  If you prefer to upload a location plan file instead of using
                  the map, please reset the map view first to erase the
                  pre-populated boundary. Then click the "Upload a location plan
                  instead" link below. A location plan can only be submitted as
                  a digital boundary or file, not both.
                </p>
              )}
              {/* @ts-ignore */}
              <my-map
                id="draw-boundary-map"
                drawMode
                drawPointer="crosshair"
                drawGeojsonData={JSON.stringify(boundary)}
                drawGeojsonDataBuffer={10}
                clipGeojsonData={
                  addressPoint &&
                  JSON.stringify(
                    buffer(addressPoint, BUFFER_IN_METERS, { units: "meters" }),
                  )
                }
                zoom={20}
                maxZoom={23}
                latitude={Number(passport?.data?._address?.latitude)}
                longitude={Number(passport?.data?._address?.longitude)}
                showCentreMarker
                markerLatitude={Number(passport?.data?._address?.latitude)}
                markerLongitude={Number(passport?.data?._address?.longitude)}
                resetControlImage="trash"
                osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
                osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
                drawGeojsonDataCopyright={`<a href="https://www.planning.data.gov.uk/dataset/title-boundary" target="_blank" style="color:#0010A4;">Title boundary</a> subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100026316`}
              />
            </MapContainer>
            <MapFooter>
              <Typography variant="body1">
                The property boundary you have drawn is{" "}
                <Typography
                  component="span"
                  noWrap
                  sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                >
                  {area?.toLocaleString("en-GB") ?? 0} m²
                </Typography>
              </Typography>
              {!props.hideFileUpload && (
                <Link
                  component="button"
                  onClick={() => setPage("upload")}
                  disabled={Boolean(boundary)}
                  data-testid="upload-file-button"
                >
                  <Typography variant="body1">
                    Upload a location plan instead
                  </Typography>
                </Link>
              )}
            </MapFooter>
          </FullWidthWrapper>
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
          <PrivateFileUpload slots={slots} setSlots={setSlots} maxFiles={1} />
          <Box sx={{ textAlign: "right" }}>
            <Link
              component="button"
              onClick={() => setPage("draw")}
              disabled={Boolean(slots[0]?.url)}
            >
              <Typography variant="body2">
                Draw the boundary on a map instead
              </Typography>
            </Link>
          </Box>
        </>
      );
    }
  }
}
