export const osMapsStylesResponse = {
    version: 8,
    sprite: "https://api.os.uk/maps/vector/v1/vts/resources/sprites/sprite?key=YOUR_KEY&srs=3857",
    glyphs: "https://api.os.uk/maps/vector/v1/vts/resources/fonts/{fontstack}/{range}.pbf?key=YOUR_KEY&srs=3857",
    sources: {
      esri: {
        type: "vector",
        url: "https://api.os.uk/maps/vector/v1/vts?key=YOUR_KEY&srs=3857"
      }
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#0437F2"
        }
      },
    ]
  };