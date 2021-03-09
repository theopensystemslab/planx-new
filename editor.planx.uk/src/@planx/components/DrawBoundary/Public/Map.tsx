import "mapbox-gl/dist/mapbox-gl.css";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import type { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import DrawIcon from "@material-ui/icons/Create";
import LayersIcon from "@material-ui/icons/LayersOutlined";
import React, { useEffect, useRef, useState } from "react";
import ReactMapGL, { Layer, Source } from "react-map-gl";
import { DrawPolygonMode, Editor } from "react-map-gl-draw";

import type { Boundary } from ".";

export default Map;

const useClasses = makeStyles((theme) => ({
  root: {},
  container: {
    position: "relative",
    width: "100%",
    minHeight: 200,
    height: "50vh",
    maxHeight: 500,
    // cursor: "crosshair",
  },
  modal: {
    cursor: "pointer",
    position: "absolute",
    background: "#0003",
    width: "100%",
    height: "100%",
    zIndex: 100,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& span": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "black",
      borderRadius: 5,
      verticalAlign: "center",
      color: "white",
      padding: theme.spacing(2),
      "& svg": {
        marginRight: theme.spacing(1),
      },
    },
  },
  help: {
    height: "100%",
    width: "100%",
    zIndex: 1,
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexFlow: "column",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "1rem 2rem",
    textAlign: "center",
  },
  layersPopover: {
    position: "absolute",
    bottom: 36,
    left: 8,
    zIndex: 10,
  },
  layersButton: {
    padding: theme.spacing(0.5, 1.5, 0.5, 0.5),
    backgroundColor: "#fff",
    boxShadow: "0 0 0 2px rgba(0,0,0,.1)",
    cursor: "pointer",
    display: "flex",
    fontFamily: "inherit",
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
}));

interface Props {
  lng: number;
  lat: number;
  zoom: number;
  setBoundary: (boundary: Boundary) => void;
}

const LAYER_ORDNANCE_SURVEY = "ordnance-survey";
function Map(props: Props) {
  const classes = useClasses();
  const [hasStartedDrawing, setHasStartedDrawing] = useState<Boolean>(false);
  const [showStyles, setShowStyles] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [layer, setLayer] = useState<string>(LAYER_ORDNANCE_SURVEY);
  const [showHelp, setShowHelp] = useState<Boolean>(false);
  const [mode, setMode] = useState(new DrawPolygonMode());
  const [polygon, setPolygon] = useState<Boundary>();
  useEffect(() => {
    props.setBoundary(polygon);
  }, [polygon]);
  const [viewport, setViewport] = useState({
    latitude: props.lat,
    longitude: props.lng,
    zoom: props.zoom,
    bearing: 0,
    pitch: 0,
  });
  const [editorKey, setEditorKey] = useState<boolean>(false);
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {!hasStartedDrawing && (
          <div
            className={classes.modal}
            onClick={() => {
              setHasStartedDrawing(true);
            }}
          >
            <span>
              <DrawIcon /> Start drawing
            </span>
          </div>
        )}

        {polygon && (
          <div
            className={classes.modal}
            onClick={() => {
              setPolygon(undefined);
              setEditorKey((x) => !x);
            }}
          >
            <span>
              <DrawIcon /> Change boundary
            </span>
          </div>
        )}
        <ReactMapGL
          {...viewport}
          width="100%"
          height="50vh"
          mapStyle={
            // XXX: Mapbox only shows the Ordnance Survey layer if we give it a valid mapStyle too.
            //      Although this is unfortunate, at least the mapbox layerStyle below works as a fallback
            //      in case Ordnance Survey's API stops working.
            layer === LAYER_ORDNANCE_SURVEY
              ? "mapbox://styles/opensystemslab/ckbuw2xmi0mum1il33qucl4dv"
              : layer
          }
          onViewportChange={setViewport}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ?? ""}
        >
          <Source
            id="source_id"
            type="raster"
            tiles={[
              `https://api.os.uk/maps/raster/v1/zxy/Road_3857/{z}/{x}/{y}.png?key=${process.env.REACT_APP_ORDNANCE_SURVEY_KEY}`,
            ]}
            tileSize={256}
          >
            <Layer
              type="raster"
              paint={{}}
              layout={{
                visibility:
                  layer === LAYER_ORDNANCE_SURVEY ? "visible" : "none",
              }}
            />
          </Source>
          <Editor
            key={String(editorKey)}
            mode={!polygon ? mode : undefined}
            clickRadius={12}
            onUpdate={(data: any) => {
              if (data.editType === "addFeature") {
                setPolygon(data.data[0]); //.geometry.coordinates[0]);
              }
            }}
            featureStyle={() => ({
              // https://www.npmjs.com/package/react-map-gl-draw#user-content-explanations
              stroke: "rgb(255, 0, 0)",
              strokeOpacity: 0.8,
              strokeDasharray: "8,4",
              fill: "rgb(189,189,189)",
              strokeWidth: 5,
              fillOpacity: 0.3,
            })}
          />
        </ReactMapGL>
        <ClickAwayListener onClickAway={() => setShowStyles(false)}>
          <Box className={classes.layersPopover}>
            {showStyles ? (
              <MapStyleSwitcher
                handleChange={(e: any) => {
                  setLayer(e.target.value);
                }}
                layer={layer}
              />
            ) : null}
            <ButtonBase
              className={classes.layersButton}
              onClick={() => setShowStyles((x) => !x)}
            >
              <LayersIcon /> Layers
            </ButtonBase>
          </Box>
        </ClickAwayListener>
      </div>
    </div>
  );
}

const useLayersClasses = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 1),
    backgroundColor: "#fff",
    boxShadow: "0 0 0 2px rgba(0,0,0,.1)",
    marginBottom: theme.spacing(1),
  },
  legend: {
    fontSize: 12,
    fontWeight: 700,
  },
  radioLabel: {
    fontSize: 14,
  },
}));
function MapStyleSwitcher({ handleChange, layer, options }: any) {
  const classes = useLayersClasses();
  return (
    <FormControl component="fieldset" className={classes.root}>
      <RadioGroup
        aria-label="Map style"
        name="mapstyle"
        value={layer}
        onChange={handleChange}
      >
        <FormControlLabel
          value={LAYER_ORDNANCE_SURVEY}
          control={<Radio size="small" />}
          label="Streets"
          classes={{ label: classes.radioLabel }}
        />
        <FormControlLabel
          value="mapbox://styles/mapbox/satellite-v9"
          control={<Radio size="small" />}
          label="Satellite"
          classes={{ label: classes.radioLabel }}
        />
      </RadioGroup>
    </FormControl>
  );
}
