import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React, {  } from "react";
import { Link as ReactNaviLink } from "react-navi";

const ViewApplicationLink: React.FC = () => (
  <Link
    sx={{ display: "block", mt: 1, textAlign: "right" }}
    component={ReactNaviLink}
    href="view-application"
    prefetch={false}
  >
    <Typography variant="body2">
      View form
    </Typography>
  </Link>
)

export default ViewApplicationLink;