import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import type { Theme } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/core/styles";
import DrawIcon from "@material-ui/icons/Create";
import LayersIcon from "@material-ui/icons/LayersOutlined";
import MapStyleSwitcher from "@planx/components/FindProperty/Public/FindProperty/MapStyleSwitcher";
import turfArea from "@turf/area";
import mapboxgl from "mapbox-gl";
import React from "react";

const styles = (theme: Theme) =>
  ({
    container: {
      position: "relative",
      width: "100%",
      minHeight: 200,
      // height: "50vh",
      // maxHeight: 500,
      // height: 300,
    },
    map: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      fontFamily: "inherit",
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
    mapStyles: {
      position: "absolute",
      bottom: 36,
      left: 8,
      zIndex: 10,
    },
    mapStylesBtn: {
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
    startBtn: {
      borderRadius: "2em",
      paddingLeft: theme.spacing(6),
      "& svg": {
        position: "absolute",
        left: theme.spacing(2),
      },
    },
  } as any);

mapboxgl.accessToken =
  "pk.eyJ1Ijoib3BlbnN5c3RlbXNsYWIiLCJhIjoiY2sybHJ6cnY2MGFkaTNjcHIwanV1eGRlbCJ9.xAHUuQo1RAnzwOlN90SGVQ";

interface Props {
  lng: number;
  lat: number;
  zoom: number;
  setBoundary: Function;
  classes: Record<never, string>;
}

class Map extends React.Component<
  Props,
  { loading: Boolean; help: Boolean; showStyles: Boolean; layer: String }
> {
  draw: any;
  map: any;
  mapContainer: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      help: false,
      showStyles: false,
      layer: "",
    };
  }

  closeHelp = () => {
    this.setState({ help: false });
    this.draw.changeMode("draw_polygon");
  };

  switchLayer = (layer: any) => {
    if (layer !== "") {
      this.map.setStyle("mapbox://styles/mapbox/" + layer);
    } else {
      this.map.setStyle(
        "mapbox://styles/opensystemslab/ckbuw2xmi0mum1il33qucl4dv"
      );
    }
  };

  componentDidMount() {
    const { lat, lng, zoom } = this.props;
    // this.map = new mapboxgl.Map({
    //   container: this.mapContainer,
    //   style: "mapbox://styles/opensystemslab/ckbuw2xmi0mum1il33qucl4dv",
    //   zoom: zoom,
    //   center: [lng, lat],
    // });

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/opensystemslab/ckbuw2xmi0mum1il33qucl4dv",
      zoom: zoom,
      center: [lng, lat],
    });
    const map = this.map;
    map.on("load", function () {
      map.style.stylesheet.layers.forEach(function (layer: any) {
        // console.log(layer);
        if (!["aeroway-line", "inspire-polygons"].includes(layer.id)) {
          map.removeLayer(layer.id);
        }
      });

      map.addSource("wms-test-source", {
        type: "raster",
        tiles: [
          "https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/EPSG%3A3857/Road 3857/{z}/{x}/{y}.png?key=As5amifxsKGqGC55OmHuqm2p3CGoAv85",
          // "https://imgproxy.planx.in/insecure/fill/256/256/sm/0/"
        ],
        tileSize: 256,
      });
      map.addLayer(
        {
          id: "wms-test-layer",
          type: "raster",
          source: "wms-test-source",
          paint: {
            // "background-color": "#ffffff",
          },
        },
        "aeroway-line"
      );
    });

    // this.map.addSource("mastermap", {
    //   type: "vector",
    //   tiles: [
    //     "https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/EPSG%3A3857/Road 3857/{z}/{x}/{y}.png?key=As5amifxsKGqGC55OmHuqm2p3CGoAv85",
    //   ],
    //   tileSize: 256,
    // });
    // this.map.addLayer(
    //   {
    //     id: "mastermap-layer",
    //     type: "vector",
    //     source: "mastermap",
    //     paint: {},
    //   },
    //   "mastermap"
    // );

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },
      styles: [
        // ACTIVE (being drawn)
        // line stroke
        {
          id: "gl-draw-line",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#D20C0C",
            "line-width": 2,
          },
        },
        // polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#D20C0C",
            "fill-outline-color": "#D20C0C",
            "fill-opacity": 0,
          },
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#D20C0C",
            "line-width": 2,
          },
        },
        // vertex point halos
        {
          id: "gl-draw-polygon-and-line-vertex-halo-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 5,
            "circle-color": "#FFF",
          },
        },
        // vertex points
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: [
            "all",
            ["==", "meta", "vertex"],
            ["==", "$type", "Point"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "circle-radius": 3,
            "circle-color": "#D20C0C",
          },
        },
      ],
    });

    const draw = this.draw;

    map.on("load", () => {
      this.setState({ loading: false });
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    map.addControl(draw, "bottom-right");

    const updateArea = () => {
      var data = draw.getAll();

      if (data.features.length > 0) {
        var area = turfArea(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
        this.props.setBoundary({ area: rounded_area, polygon: data.features });
      }
    };

    map.on("draw.create", updateArea);
    map.on("draw.delete", updateArea);
    map.on("draw.update", updateArea);
  }

  render() {
    const classes = this.props as any;
    const { layer, help, showStyles, loading } = this.state;
    return (
      <div>
        <div className={classes.container}>
          <div ref={(el) => (this.mapContainer = el)} className={classes.map}>
            <ClickAwayListener
              onClickAway={() => this.setState({ showStyles: false })}
            >
              <Box className={classes.mapStyles} style={{ minHeight: 300 }}>
                {this.state.showStyles ? (
                  <MapStyleSwitcher
                    handleChange={(e: any) => {
                      this.setState({ layer: e.target.value });
                      this.switchLayer(e.target.value);
                    }}
                    layer={layer}
                  />
                ) : null}
                <ButtonBase
                  className={classes.mapStylesBtn}
                  onClick={() => this.setState({ showStyles: !showStyles })}
                >
                  <LayersIcon /> Map style
                </ButtonBase>
              </Box>
            </ClickAwayListener>
            {help && (
              <Box className={classes.help}>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Button
                    className={classes.startBtn}
                    size="large"
                    variant="contained"
                    color="primary"
                    onClick={this.closeHelp}
                  >
                    <DrawIcon /> Start drawing
                  </Button>
                )}
              </Box>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Map);
