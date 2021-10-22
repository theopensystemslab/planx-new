import "./map.css";

import { createComponent } from "@lit-labs/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
// @ts-ignore
import { MyMap } from "@opensystemslab/map";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import type { Geometry } from "@turf/helpers";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import InputRow from "ui/InputRow";
import OptionButton from "ui/OptionButton";

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
    fontSize: "medium",
    marginTop: theme.spacing(1),
    "& a": {
      color: theme.palette.text.primary,
      cursor: "pointer",
      padding: theme.spacing(2),
    },
    "& a:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

// ref https://www.npmjs.com/package/@lit-labs/react
export const MyMapComponent = createComponent(React, "my-map", MyMap, {
  areaChange: "areaChange", // listens to drawMode only
  geojsonChange: "geojsonChange", // listens to drawMode only
});

export default function Component(props: Props) {
  const [page, setPage] = useState<"draw" | "upload">("draw");
  const passport = useStore((state) => state.computePassport());
  const classes = useClasses();
  const [boundary, setBoundary] = useState<Boundary>();
  const [url, setUrl] = useState<string | undefined>();
  const [area, setArea] = useState<number | undefined>();
  const [drawInteraction, setDrawInteraction] = useState<string>("click");

  const areaChangeHandler = ({ detail }: { detail: string }) => {
    const numberString = detail.split(" ")[0];
    const area = Number(numberString);
    setArea(area);
  };

  const geojsonChangeHandler = ({ detail: geojson }: any) => {
    // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
    setBoundary(geojson.features[0]);
  };

  useEffect(() => {
    setUrl(undefined);
  }, [page, drawInteraction, setArea, setBoundary, setUrl]);

  return (
    <Card handleSubmit={handleSubmit} isValid={Boolean(boundary || url)}>
      {getBody()}
    </Card>
  );

  function getBody() {
    const mapInteractionOptions = [
      {
        value: "click",
        label: "Click-to-select mode",
      },
      {
        value: "draw",
        label: "Draw mode",
      },
    ];

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
          <InputRow>
            {mapInteractionOptions.map((option, index) => (
              <OptionButton
                selected={drawInteraction === option.value}
                key={index}
                onClick={() => {
                  setDrawInteraction(option.value);
                }}
              >
                {option.label}
              </OptionButton>
            ))}
          </InputRow>
          <Box className={classes.map}>{getMap()}</Box>
          <p className={classes.uploadInstead}>
            <a onClick={() => setPage("upload")}>Upload a file instead</a>
          </p>
          <p>
            The boundary has an area of <strong>{area ?? 0} m²</strong>
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

  function getMap() {
    if (drawInteraction === "draw") {
      return (
        // @ts-ignore
        <MyMapComponent
          drawMode
          zoom={19}
          maxZoom={20}
          latitude={Number(passport?.data?._address.latitude)}
          longitude={Number(passport?.data?._address.longitude)}
          areaChange={areaChangeHandler}
          geojsonChange={geojsonChangeHandler}
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          ariaLabel={drawInteraction}
        />
      );
    } else if (drawInteraction === "click") {
      return (
        // @ts-ignore
        <MyMapComponent
          showFeaturesAtPoint
          clickFeatures
          featureColor="#ff0000"
          featureFill
          zoom={19.5}
          latitude={Number(passport?.data?._address.latitude)}
          longitude={Number(passport?.data?._address.longitude)}
          hideResetControl
          osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
          osFeaturesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_FEATURES_KEY}
          ariaLabel={drawInteraction}
        />
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
