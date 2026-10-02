import Button from "@mui/material/Button";
import { IconCloudDownload } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

type Props = {
  sessionId: string;
  submittedAt: string;
};

export const DownloadSubmissionButton = (props: Props) => {
  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/submission/${props.sessionId}/zip`;

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => window.open(zipUrl, "_blank")}
      disabled={!props.submittedAt}
      startIcon={<Icon icon={IconCloudDownload} />}
    >
      Download
    </Button>
  );
};
