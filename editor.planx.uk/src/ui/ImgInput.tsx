import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import React, { useMemo, useState } from "react";

import PublicFileUploadButton from "./PublicFileUploadButton";
import { useStore } from "pages/FlowEditor/lib/store";

const ImageUploadContainer = styled(Box)(() => ({
  height: 50,
  width: 50,
  position: "relative",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: theme.palette.common.white,
  top: 0,
  right: 0,
}));

/** Uploads an image and returns corresponding URL */
export default function ImgInput({
  img,
  onChange,
}: {
  img?: string;
  onChange?: (newUrl?: string) => void;
}): FCReturn {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Auto-generate a random ID on mount
  const menuId = useMemo(() => {
    return `menu-${Math.floor(Math.random() * 1000000)}`;
  }, []);

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return img ? (
    <ImageUploadContainer>
      <StyledIconButton
        id={`${menuId}-trigger`}
        color="inherit"
        size="small"
        aria-label="Options"
        onClick={(ev) => {
          setAnchorEl(ev.currentTarget);
        }}
      >
        <MoreVert />
      </StyledIconButton>
      <Menu
        id={`${menuId}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem component="a" href={img} target="_blank">
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            onChange && onChange(undefined);
          }}
          disabled={!useStore.getState().canUserEditTeam(teamSlug)}
        >
          Remove
        </MenuItem>
      </Menu>
      <img width={50} height={50} src={img} alt="embedded img" />
    </ImageUploadContainer>
  ) : (
    <Tooltip title="Drop file here">
      <ImageUploadContainer>
        <PublicFileUploadButton
          onChange={(newUrl) => {
            setAnchorEl(null);
            onChange && onChange(newUrl);
          }}
          disabled={!useStore.getState().canUserEditTeam(teamSlug)}
        />
      </ImageUploadContainer>
    </Tooltip>
  );
}
