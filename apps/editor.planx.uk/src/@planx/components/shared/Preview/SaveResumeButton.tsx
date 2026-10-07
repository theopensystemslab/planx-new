import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useLPS } from "hooks/useLPS";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath } from "types";
const SaveResumeButton: React.FC = () => {
  const saveToEmail = useStore((state) => state.saveToEmail);
  const { trackEvent } = useAnalyticsTracking();
  const { url: lpsUrl } = useLPS();

  const handleSaveClick = () => {
    trackEvent({ event: "saveClick", metadata: null });
    trackEvent({
      event: "flowDirectionChange",
      metadata: null,
      flowDirection: "save",
    });
    useStore.setState({ path: ApplicationPath.Save });
  };

  if (saveToEmail) {
    return (
      <Link component="button" onClick={handleSaveClick}>
        <Typography variant="body1" sx={{ textAlign: "left" }}>
          Save and return to this form later
        </Typography>
      </Link>
    );
  }

  return (
    <Link href={`${lpsUrl}/applications`} target="_blank">
      <Typography variant="body1" sx={{ textAlign: "left" }}>
        Resume a form you have already started (opens in a new tab)
      </Typography>
    </Link>
  );
};

export default SaveResumeButton;
