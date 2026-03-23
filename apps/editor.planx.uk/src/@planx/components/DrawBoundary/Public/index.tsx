import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import {
  MapContainer,
  MapFooter,
} from "@planx/components/shared/Preview/MapContainer";
import { PrivateFileUpload } from "@planx/components/shared/PrivateFileUpload/PrivateFileUpload";
import type { PublicProps } from "@planx/components/shared/types";
import { squareMetresToHectares } from "@planx/components/shared/utils";
import buffer from "@turf/buffer";
import { point } from "@turf/helpers";
import { Feature } from "geojson";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { array } from "yup";

import {
  DrawBoundary,
  DrawBoundaryUserAction,
  PASSPORT_COMPONENT_ACTION_KEY,
  PASSPORT_UPLOAD_KEY,
} from "../model";

export type Props = PublicProps<DrawBoundary>;

export type Boundary = Feature | undefined;

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "Upload a location plan",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
        slots.length === 1 &&
        !slots.some((slot) => slot.status === "uploading") &&
        slots.every((slot) => slot.url && slot.status === "success"),
      );
    },
  });

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const [passport, teamSlug] = useStore((state) => [
    state.computePassport(),
    state.teamSlug,
  ]);
  const drawViewRef = useRef<HTMLDivElement>(null);
  const uploadViewRef = useRef<HTMLDivElement>(null);

  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.fn] ||
    passport.data?.["property.boundary"];
  const previousArea =
    props.previouslySubmittedData?.data?.[`${props.fn}.area`] ||
    passport.data?.["property.boundary.area"];

  const [boundary, setBoundary] = useState<Boundary>(previousBoundary);
  const [area, setArea] = useState<number | undefined>(previousArea);
  const [mapValidationError, setMapValidationError] = useState<string>();

  // Buffer applied to the address point to clip this map extent
  //   and applied to the site boundary and written to the passport to later clip the map extent in overview documents
  let bufferInMeters: number = area && area > 15000 ? 300 : 120;
  if (["strategic-and-local-plan", "tewkesbury"].includes(teamSlug)) {
    // Cheltenham, Gloucester and Tewkesbury share a Strategic Local Plan
    //   These teams uniquely support a joint boundary which requires larger buffer
    bufferInMeters = 10000;
  }

  const previousFile =
    props.previouslySubmittedData?.data?.[PASSPORT_UPLOAD_KEY];
  const startPage = previousFile ? "upload" : "draw";
  const [page, setPage] = useState<"draw" | "upload">(startPage);

  const [slots, setSlots] = useState<FileUploadSlot[]>(previousFile ?? []);
  const [fileValidationError, setFileValidationError] = useState<string>();

  const addressPoint =
    passport?.data?._address?.longitude &&
    passport?.data?._address?.latitude &&
    point([
      Number(passport?.data?._address?.longitude),
      Number(passport?.data?._address?.latitude),
    ]);
  const environment = useStore((state) => state.previewEnvironment);

  useEffect(() => {
    if (isMounted.current) {
      if (page === "draw" && drawViewRef.current) {
        drawViewRef.current.focus();
      } else if (page === "upload" && uploadViewRef.current) {
        uploadViewRef.current.focus();
      }
    }
  }, [page]);

  useEffect(() => {
    if (isMounted.current) setSlots([]);
    isMounted.current = true;

    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
        setBoundary(geojson["EPSG:3857"].features[0]);
        setArea(
          geojson["EPSG:3857"].features[0]?.properties?.["area.squareMetres"],
        );
      } else {
        // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set boundary to undefined & area to 0
        setBoundary(undefined);
        setArea(0);
      }
    };

    const map: any = document.getElementById("draw-boundary-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [page, setArea, setBoundary, setSlots]);

  /**
   * Declare refs to hold a mutable copy the up-to-date validation errors
   * The intention is to prevent frequent unnecessary update loops that clears the
   * validation error state if it is already empty.
   */
  const fileValidationErrorRef = useRef(fileValidationError);
  useEffect(() => {
    fileValidationErrorRef.current = fileValidationError;
  }, [fileValidationError]);

  useEffect(() => {
    if (fileValidationErrorRef.current) {
      setFileValidationError(undefined);
    }
  }, [slots]);

  const mapValidationErrorRef = useRef(mapValidationError);
  useEffect(() => {
    mapValidationErrorRef.current = mapValidationError;
  }, [mapValidationError]);

  useEffect(() => {
    if (mapValidationErrorRef.current) {
      setMapValidationError(undefined);
    }
  }, [boundary]);

  const validateAndSubmit = () => {
    const newPassportData: Store.UserData["data"] = {};

    // Used the map
    if (page === "draw") {
      if (!props.hideFileUpload && !boundary) {
        setMapValidationError("Draw a boundary");
      }

      if (props.hideFileUpload && !boundary) {
        props.handleSubmit?.({ data: { ...newPassportData } });
      }

      if (boundary && props.fn) {
        newPassportData[props.fn] = boundary;
        newPassportData[`${props.fn}.buffered`] = buffer(
          boundary,
          bufferInMeters,
          { units: "meters" },
        );

        if (area && props.fn) {
          newPassportData[`${props.fn}.area`] = area;
          newPassportData[`${props.fn}.hectares`] =
            squareMetresToHectares(area);
        }

        // Track the type of map interaction
        if (
          boundary?.geometry === passport.data?.["property.boundary"]?.geometry
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

        props.handleSubmit?.({ data: { ...newPassportData } });
      }
    }

    // Uploaded a file
    if (page === "upload") {
      slotsSchema
        .validate(slots, { context: { slots } })
        .then(() => {
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

          props.handleSubmit?.({ data: { ...newPassportData } });
        })
        .catch((err) => setFileValidationError(err?.message));
    }
  };

  /**
   * Clip map extent to buffered boundary, with a fallback to address point if required
   */
  const clipGeojsonData = (() => {
    if (boundary)
      return JSON.stringify(
        buffer(boundary, bufferInMeters, { units: "meters" }),
      );
    if (addressPoint)
      return JSON.stringify(
        buffer(addressPoint, bufferInMeters, { units: "meters" }),
      );
  })();

  function getBody(mapValidationError?: string, fileValidationError?: string) {
    if (page === "draw") {
      return (
        <Box
          ref={drawViewRef}
          tabIndex={-1}
          sx={{
            maxWidth: "none",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          <CardHeader
            title={props.title}
            description={props.description}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <FullWidthWrapper>
            <ErrorWrapper error={mapValidationError} id="draw-boundary-map">
              <MapContainer environment={environment} size="large">
                <p style={visuallyHidden}>
                  An interactive map centred on your address, pre-populated with
                  a red boundary that includes the entire property, using
                  information from the Land Registry. You can accept this
                  boundary as your location plan by continuing, you can amend it
                  by selecting and dragging the points, or you can erase it by
                  selecting the reset button and draw a new custom boundary.
                </p>
                {!props.hideFileUpload && (
                  <p style={visuallyHidden}>
                    If you prefer to upload a file instead of using the
                    interactive map, please select "Upload a location plan
                    instead" below to navigate to the file upload.
                  </p>
                )}
                {/* @ts-ignore */}
                <my-map
                  id="draw-boundary-map"
                  ariaLabelOlFixedOverlay="An interactive map for providing your location plan boundary"
                  drawMode
                  drawPointer="crosshair"
                  drawGeojsonData={JSON.stringify(boundary)}
                  drawGeojsonDataBuffer={10}
                  clipGeojsonData={clipGeojsonData}
                  zoom={20}
                  maxZoom={23}
                  latitude={Number(passport?.data?._address?.latitude)}
                  longitude={Number(passport?.data?._address?.longitude)}
                  showCentreMarker
                  markerLatitude={Number(passport?.data?._address?.latitude)}
                  markerLongitude={Number(passport?.data?._address?.longitude)}
                  resetControlImage="trash"
                  osProxyEndpoint={`${
                    import.meta.env.VITE_APP_API_URL
                  }/proxy/ordnance-survey`}
                  osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS AC0000812160`}
                  drawGeojsonDataCopyright={`<a href="https://www.planning.data.gov.uk/dataset/title-boundary" target="_blank" style="color:#0010A4;">Title boundary (opens in a new tab)</a> subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100026316`}
                  collapseAttributions={
                    self.innerWidth < 500 ? true : undefined
                  }
                />
              </MapContainer>
            </ErrorWrapper>
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
                  data-testid="upload-file-button"
                >
                  <Typography variant="body1" align="right">
                    Upload a location plan instead
                  </Typography>
                </Link>
              )}
            </MapFooter>
          </FullWidthWrapper>
        </Box>
      );
    } else if (page === "upload") {
      return (
        <Box
          ref={uploadViewRef}
          tabIndex={-1}
          sx={{
            "&:focus": {
              outline: "none",
            },
          }}
        >
          <CardHeader
            title={props.titleForUploading}
            description={props.descriptionForUploading}
            info={props.info}
            policyRef={props.policyRef}
            howMeasured={props.howMeasured}
            definitionImg={props.definitionImg}
          />
          <ErrorWrapper error={fileValidationError} id="upload-location-plan">
            <PrivateFileUpload slots={slots} setSlots={setSlots} maxFiles={1} />
          </ErrorWrapper>
          <Box sx={{ textAlign: "right" }}>
            <Link
              component="button"
              onClick={() => setPage("draw")}
              data-testid="use-map-button"
            >
              <Typography variant="body2">
                Draw the boundary on a map instead
              </Typography>
            </Link>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Card handleSubmit={validateAndSubmit} isValid={true}>
      {getBody(mapValidationError, fileValidationError)}
    </Card>
  );
}
