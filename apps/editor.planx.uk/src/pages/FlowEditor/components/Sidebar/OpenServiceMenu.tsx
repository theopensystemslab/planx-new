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
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  icon,
  title,
  description,
  href,
  onClick,
}) => (
  <Card sx={{ borderRadius: "2px" }}>
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
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

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
  const { origin } = window.location;

  const draftURL = `${origin}${router.buildLocation({ to: "/$team/$flow/draft", params: { team, flow: rootFlow } }).href}`;
  const previewURL = `${origin}${router.buildLocation({ to: "/$team/$flow/preview", params: { team, flow: rootFlow } }).href}`;
  const publishedURL = `${origin}${router.buildLocation({ to: "/$team/$flow/published", params: { team, flow: rootFlow }, search: { analytics: false } }).href}`;

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl((prev) => (prev ? null : event.currentTarget));

  const closeMenu = () => setAnchorEl(null);

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
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: "5px",
              overflow: "hidden",
              bgcolor: "background.dark",
              maxWidth: "320px",
            },
          },
        }}
      >
        <Stack p={1} gap={1} minWidth={240}>
          <Permission.IsPlatformAdmin>
            <MenuItemCard
              icon={<PlayArrowIcon fontSize="small" sx={{ mt: 0.25 }} />}
              title="Draft"
              description="Admin only view with unpublished nested flows"
              href={draftURL}
              onClick={closeMenu}
            />
          </Permission.IsPlatformAdmin>

          <MenuItemCard
            icon={<PlayArrowIcon fontSize="small" sx={{ mt: 0.25 }} />}
            title="Preview"
            description="Review and test your service before publishing"
            href={previewURL}
            onClick={closeMenu}
          />

          <MenuItemCard
            icon={<LanguageIcon fontSize="small" sx={{ mt: 0.25 }} />}
            title="Published"
            description={
              isFlowPublished
                ? "The live version of your service that is publically accessible"
                : "Not yet published"
            }
            href={isFlowPublished ? publishedURL : undefined}
            onClick={closeMenu}
          />
        </Stack>
      </Popover>
    </>
  );
};
