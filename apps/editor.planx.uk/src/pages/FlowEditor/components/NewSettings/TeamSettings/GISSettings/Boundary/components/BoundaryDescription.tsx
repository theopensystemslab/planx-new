import Link from "@mui/material/Link";
import React from "react";

export const BoundaryDescription: React.FC = () => (
  <>
    <p>
      The boundary URL is used to retrieve the outer boundary of your council
      area. The bounding box of your boundary (shown below) limits the area
      applicants can access via the map within your services.
    </p>
    <p>
      The detailed boundary is still referenced when planning constraints are
      checked.
    </p>
    <p>
      The boundary should be given as a link from:{" "}
      <Link
        href="https://www.planning.data.gov.uk/"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://www.planning.data.gov.uk/entity/1234567
      </Link>
    </p>
  </>
);
