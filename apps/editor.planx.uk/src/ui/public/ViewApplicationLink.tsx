import Button from "@mui/material/Button";
import React from "react";
import { Link as ReactNaviLink } from "react-navi";

const ViewApplicationLink: React.FC = () => (
  <ReactNaviLink
    href="view-application"
    prefetch={false}
    onContextMenu={(e) => e.preventDefault()}
    style={{ textDecoration: "none" }}
  >
    <Button variant="contained" color="secondary">
      Print form
    </Button>
  </ReactNaviLink>
);

export default ViewApplicationLink;
