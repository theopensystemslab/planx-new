import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useId, useState } from "react";
import { CloseButton } from "ui/shared/CloseButton";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

const DowntimeBannerWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5em 0",
  position: "relative",
  zIndex: theme.zIndex.appBar,
}));

export const DEFAULT_TITLE =
  "Partial degradation of some services and features";

export interface DowntimeBannerProps {
  /** Plain text, displayed in bold */
  title?: string | null;
  /** Rich text (HTML), displayed in a "More information" modal */
  description?: string | null;
  /** Render without live region semantics, e.g. when previewing in the editor */
  isPreview?: boolean;
}

const DowntimeBanner: React.FC<DowntimeBannerProps> = ({
  title,
  description,
  isPreview = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTitleId = useId();

  const trimmedTitle = title?.trim();
  const trimmedDescription = description?.trim();

  // Fall back to default content if nothing has been configured
  const displayTitle = trimmedTitle || DEFAULT_TITLE;

  return (
    <DowntimeBannerWrapper data-testid="downtime-banner">
      <Container
        maxWidth="contentWrap"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          role={isPreview ? undefined : "alert"}
          aria-live={isPreview ? undefined : "assertive"}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <BrokenImageIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            <strong>{displayTitle}</strong>
            {trimmedDescription && (
              <>
                {" "}
                <Link
                  component="button"
                  variant="body2"
                  color="inherit"
                  onClick={() => setIsModalOpen(true)}
                  sx={{ verticalAlign: "baseline", fontWeight: "bold" }}
                >
                  More information{" "}
                  <Box component="span" sx={visuallyHidden}>
                    about {displayTitle}
                  </Box>
                </Link>
              </>
            )}
          </Typography>
        </Box>
      </Container>
      {trimmedDescription && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="md"
          fullWidth
          aria-labelledby={modalTitleId}
        >
          <Box sx={{ display: "flex", alignItems: "center", marginX: 1 }}>
            <DialogTitle id={modalTitleId} variant="h3" component="h2">
              {displayTitle}
            </DialogTitle>
            <CloseButton
              title="Close more information"
              onClick={() => setIsModalOpen(false)}
            />
          </Box>
          <DialogContent dividers>
            <ReactMarkdownOrHtml
              source={trimmedDescription}
              openLinksOnNewTab
            />
          </DialogContent>
        </Dialog>
      )}
    </DowntimeBannerWrapper>
  );
};

export default DowntimeBanner;
