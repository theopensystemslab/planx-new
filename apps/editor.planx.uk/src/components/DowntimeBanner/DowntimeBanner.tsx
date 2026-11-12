import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useId, useState } from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

/** Matches the style of ui/shared/WarningContainer */
const DowntimeBannerWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  borderBottom: `solid 2px ${theme.palette.warning.dark}`,
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 0),
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
  /** Centre banner content in the editor */
  centred?: boolean;
}

const DowntimeBanner: React.FC<DowntimeBannerProps> = ({
  title,
  description,
  isPreview = false,
  centred = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTitleId = useId();

  const trimmedTitle = title?.trim();
  const trimmedDescription = description?.trim();

  // Fall back to default content if nothing has been configured
  const displayTitle = trimmedTitle || DEFAULT_TITLE;

  return (
    <DowntimeBannerWrapper data-testid="downtime-banner">
      <Container maxWidth="contentWrap">
        <Box
          role={isPreview ? undefined : "alert"}
          aria-live={isPreview ? undefined : "assertive"}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: centred ? "center" : "flex-start",
            gap: 1.25,
          }}
        >
          <ErrorOutlineOutlined
            sx={{ color: "warning.dark" }}
            aria-hidden="true"
          />
          <Typography
            variant="body2"
            component="div"
            sx={{
              pt: 0.25,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: centred ? "center" : "flex-start",
              columnGap: 1,
            }}
          >
            <strong>{displayTitle}</strong>
            {trimmedDescription && (
              <>
                {" "}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  color="inherit"
                  onClick={() => setIsModalOpen(true)}
                  sx={{ fontWeight: "bold" }}
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
          maxWidth="sm"
          aria-labelledby={modalTitleId}
        >
          <DialogTitle id={modalTitleId} variant="h3" component="h1">
            {displayTitle}
          </DialogTitle>
          <DialogContent dividers sx={{ "& > * > :first-child": { mt: 0 } }}>
            <ReactMarkdownOrHtml
              source={trimmedDescription}
              openLinksOnNewTab
            />
          </DialogContent>
          <DialogActions>
            <Button
              type="button"
              color="secondary"
              variant="contained"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </DowntimeBannerWrapper>
  );
};

export default DowntimeBanner;
