import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { FileUploadSlot } from "@planx/components/FileUpload/Public";
import Card from "@planx/components/shared/Preview/Card";
import {
  MapContainer,
  MapFooter,
} from "@planx/components/shared/Preview/MapContainer";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PrivateFileUpload } from "@planx/components/shared/PrivateFileUpload/PrivateFileUpload";
import type { PublicProps } from "@planx/components/ui";
import buffer from "@turf/buffer";
import { type GeometryObject,point } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FullWidthWrapper from "ui/FullWidthWrapper";

import { DrawBoundary, PASSPORT_UPLOAD_KEY } from "../model";

export type Props = PublicProps<DrawBoundary>;

export type Boundary = GeometryObject | undefined;

export default function Component(props: Props) {
  const isMounted = useRef(false);
  const previousBoundary =
    props.previouslySubmittedData?.data?.[props.dataFieldBoundary];
  const previousArea =
    props.previouslySubmittedData?.data?.[props.dataFieldArea];
  const previousFile =
    props.previouslySubmittedData?.data?.[PASSPORT_UPLOAD_KEY];
  const startPage = previousFile ? "upload" : "draw";
  const [page, setPage] = useState<"draw" | "upload">(startPage);
  const passport = useStore((state) => state.computePassport());
  const [boundary, setBoundary] = useState<Boundary>(previousBoundary);
  const [slots, setSlots] = useState<FileUploadSlot[]>(previousFile ?? []);
  const [area, setArea] = useState<number | undefined>(previousArea);
  const environment = useStore((state) => state.previewEnvironment);
  const addressPoint = point([
    Number(passport?.data?._address?.longitude),
    Number(passport?.data?._address?.latitude),
  ]);

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
      handleSubmit={handleSubmit}
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
                An interactive map centred on your address, with a red pointer
                to draw your site outline. Click to place points and connect the
                lines to make your site. Once you've closed the site shape,
                click and drag the lines to modify it.
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
                clipGeojsonData={JSON.stringify(
                  buffer(addressPoint, 75, { units: "meters" }),
                )}
                zoom={20}
                maxZoom={23}
                latitude={Number(passport?.data?._address?.latitude)}
                longitude={Number(passport?.data?._address?.longitude)}
                showMarker
                markerLatitude={Number(passport?.data?._address?.latitude)}
                markerLongitude={Number(passport?.data?._address?.longitude)}
                resetControlImage="trash"
                osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
              />
            </MapContainer>
            <MapFooter>
              <Typography variant="body1">
                The site outline you have drawn is{" "}
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

  function handleSubmit() {
    const data: Store.userData["data"] = (() => {
      // set userData depending if user draws boundary or uploads file
      return {
        [props.dataFieldBoundary]:
          boundary && props.dataFieldBoundary ? boundary : undefined,
        [`${props.dataFieldBoundary}.buffered`]:
          boundary && props.dataFieldBoundary
            ? buffer(boundary, 50, { units: "meters" })
            : undefined,
        [props.dataFieldArea]:
          boundary && props.dataFieldBoundary ? area : undefined,
        [`${props.dataFieldArea}.hectares`]:
          boundary && area && props.dataFieldBoundary
            ? area / 10000
            : undefined,
        [PASSPORT_UPLOAD_KEY]: slots.length ? slots : undefined,
      };
    })();

    props.handleSubmit?.({ data });
  }
}
