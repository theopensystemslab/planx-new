var proxy = require("express-http-proxy");
var cors = require("cors");
var app = require("express")();

app.use(cors());

app.use(
  "/",
  proxy("https://southwark.preview.bops.services/api/v1/planning_applications")
);

const port = 5000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
