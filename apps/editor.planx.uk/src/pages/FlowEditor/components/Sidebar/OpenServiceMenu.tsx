import LanguageIcon from "@mui/icons-material/Language";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useParams, useRouteContext, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Permission from "ui/editor/Permission";

const OpenServiceButton = styled(Button)(({ theme }) => ({
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.default,
  minWidth: "140px",
  "&:hover": { backgroundColor: theme.palette.action.hover },
  "& svg": { fontSize: "1.15rem" },
}));

interface OpenServiceMenuProps {
  isFlowPublished: boolean;
}

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.25),
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

export const OpenServiceMenu: React.FC<OpenServiceMenuProps> = ({
  isFlowPublished,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { team } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const { rootFlow } = useRouteContext({
    from: "/_authenticated/app/$team/$flow",
  });
  const router = useRouter();
  const { origin } = useLocation();

  const draftURL = `${origin}${router.buildLocation({ to: "/$team/$flow/draft", params: { team, flow: rootFlow } }).href}`;
  const previewURL = `${origin}${router.buildLocation({ to: "/$team/$flow/preview", params: { team, flow: rootFlow } }).href}`;
  const publishedURL = `${origin}${router.buildLocation({ to: "/$team/$flow/published", params: { team, flow: rootFlow }, search: { analytics: false } }).href}`;

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl((prev) => (prev ? null : event.currentTarget));

  return (
    <>
      <OpenServiceButton
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open}
        endIcon={<UnfoldMoreIcon />}
      >
        Open service
      </OpenServiceButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.dark",
              maxWidth: "320px",
            },
          },
        }}
      >
        <Stack p={1} gap={1} minWidth={240}>
          <Permission.IsPlatformAdmin>
            <Card>
              <CardActionArea
                LinkComponent="a"
                href={draftURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAnchorEl(null)}
              >
                <CardContent>
                  <PlayArrowIcon fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                    >
                      Draft
                    </Typography>
                    <Typography variant="body3" color="text.secondary">
                      Admin only view with unpublished nested flows
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Permission.IsPlatformAdmin>

          <Card>
            <CardActionArea
              LinkComponent="a"
              href={previewURL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAnchorEl(null)}
            >
              <CardContent>
                <PlayArrowIcon fontSize="small" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    Preview
                  </Typography>
                  <Typography variant="body3" color="text.secondary">
                    Review and test your service before publishing
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card>
            {isFlowPublished ? (
              <CardActionArea
                LinkComponent="a"
                href={publishedURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAnchorEl(null)}
              >
                <CardContent>
                  <LanguageIcon fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                    >
                      Published
                    </Typography>
                    <Typography variant="body3" color="text.secondary">
                      The live version of your service that is publically
                      accessible
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            ) : (
              <CardActionArea disabled>
                <CardContent>
                  <LanguageIcon fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                    >
                      Published
                    </Typography>
                    <Typography variant="body3" color="text.secondary">
                      Not yet published
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            )}
          </Card>
        </Stack>
      </Popover>
    </>
  );
};
