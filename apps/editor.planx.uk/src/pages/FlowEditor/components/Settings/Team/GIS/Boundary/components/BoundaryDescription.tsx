import Link from "@mui/material/Link";

export const BoundaryDescription: React.FC = () => (
  <>
    <p>
      Provide a boundary to ensure that interactive maps displayed throughout
      your service are correctly centred and clipped. PlanX automatically
      generates a simplified bounding box (pictured) when a detailed boundary is
      provided.
    </p>
    <p>
      Find your boundary on Planning Data and paste the URL. Most teams use
      their{" "}
      <Link
        href="https://www.planning.data.gov.uk/dataset/local-planning-authority"
        target="_blank"
        rel="noopener noreferrer"
      >
        Local Planning Authority
      </Link>{" "}
      entity.
    </p>
    <p>
      Any boundary in the following format is acceptable:{" "}
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
