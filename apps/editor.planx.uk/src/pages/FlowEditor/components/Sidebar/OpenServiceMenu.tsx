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
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { Root as FlowTagRoot } from "ui/editor/FlowTag/styles";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import Permission from "ui/editor/Permission";
import PlayOutlineIcon from "ui/icons/PlayOutline";

const OpenServiceButton = styled(Button)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.default,
  minWidth: "120px",
  "&:hover": { backgroundColor: theme.palette.action.hover },
  "& svg": { fontSize: "1.15rem" },
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1, 1.5, 1),
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

interface MenuItemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick: () => void;
  isOnline?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  icon,
  title,
  description,
  href,
  onClick,
  isOnline,
}) => (
  <Card
    sx={(theme) => ({
      borderRadius: "2px",
      borderBottom: `1px solid ${theme.palette.border.light}`,
      "&:last-of-type": { borderBottom: "none" },
    })}
  >
    <CardActionArea
      {...(href
        ? {
            LinkComponent: "a",
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            onClick,
          }
        : { disabled: true })}
    >
      <CardContent>
        {icon}
        <Stack gap={0.25}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body4" color="text.secondary">
            {description}
          </Typography>
          {isOnline !== undefined && (
            <FlowTagRoot
              tagType={FlowTagType.Status}
              statusVariant={
                isOnline ? StatusVariant.Online : StatusVariant.Offline
              }
              sx={{
                fontSize: "0.875rem",
                padding: "1px 6px",
                mt: 0.6,
                alignSelf: "flex-start",
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </FlowTagRoot>
          )}
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

export const OpenServiceMenu: React.FC = () => {
  const [flowStatus, isFlowPublished] = useStore((state) => [
    state.flowStatus,
    state.isFlowPublished,
  ]);
  const isFlowOnline = flowStatus === "online";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { team } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const { rootFlow } = useRouteContext({
    from: "/_authenticated/app/$team/$flow",
  });
  const router = useRouter();
  const { origin } = window.location;

  const draftURL = `${origin}${router.buildLocation({ to: "/$team/$flow/draft", params: { team, flow: rootFlow } }).href}`;
  const previewURL = `${origin}${router.buildLocation({ to: "/$team/$flow/preview", params: { team, flow: rootFlow } }).href}`;
  const publishedURL = `${origin}${router.buildLocation({ to: "/$team/$flow/published", params: { team, flow: rootFlow }, search: { analytics: false } }).href}`;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    setAnchorEl((prev) => (prev ? null : target));
  };

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <OpenServiceButton
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open}
        endIcon={<UnfoldMoreIcon />}
      >
        View
      </OpenServiceButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: (theme) => ({
              mt: 0.5,
              borderRadius: theme.shape.borderRadius,
              overflow: "hidden",
              minWidth: "320px",
              maxWidth: "340px",
              border: `1px solid ${theme.palette.border.main}`,
            }),
          },
        }}
      >
        <Stack>
          <Permission.IsPlatformAdmin>
            <MenuItemCard
              icon={<PlayOutlineIcon fontSize="small" sx={{ mt: 0.25 }} />}
              title="Draft"
              description="Preview with unpublished nested flows"
              href={draftURL}
              onClick={closeMenu}
            />
          </Permission.IsPlatformAdmin>

          <MenuItemCard
            icon={<PlayArrowIcon fontSize="small" sx={{ mt: 0.25 }} />}
            title="Preview"
            description="Preview changes before publishing"
            href={previewURL}
            onClick={closeMenu}
          />

          <MenuItemCard
            icon={<LanguageIcon fontSize="small" sx={{ mt: 0.25 }} />}
            title="Published"
            description={
              isFlowPublished
                ? "View the current published version"
                : "Not yet published"
            }
            href={isFlowPublished ? publishedURL : undefined}
            onClick={closeMenu}
            isOnline={isFlowPublished ? isFlowOnline : undefined}
          />
        </Stack>
      </Popover>
    </>
  );
};
