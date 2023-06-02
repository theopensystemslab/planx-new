import MoreVert from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import makeStyles from "@mui/styles/makeStyles";
import React, { useMemo, useState } from "react";

import PublicFileUploadButton from "./PublicFileUploadButton";

const useClasses = makeStyles((theme) => ({
  imageUploadContainer: {
    height: 50,
    width: 50,
    position: "relative",
  },
  menu: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: theme.palette.common.white,
    top: 0,
    right: 0,
  },
}));

/** Uploads an image and returns corresponding URL */
export default function ImgInput({
  img,
  onChange,
}: {
  img?: string;
  onChange?: (newUrl?: string) => void;
}): FCReturn {
  const classes = useClasses();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Auto-generate a random ID on mount
  const menuId = useMemo(() => {
    return `menu-${Math.floor(Math.random() * 1000000)}`;
  }, []);

  return img ? (
    <div className={classes.imageUploadContainer}>
      <IconButton
        id={`${menuId}-trigger`}
        color="inherit"
        className={classes.menu}
        size="small"
        aria-label="Options"
        onClick={(ev) => {
          setAnchorEl(ev.currentTarget);
        }}
      >
        <MoreVert />
      </IconButton>
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
        >
          Remove
        </MenuItem>
      </Menu>
      <img width={50} height={50} src={img} alt="embedded img" />
    </div>
  ) : (
    <Tooltip title="Drop file here">
      <div className={classes.imageUploadContainer}>
        <PublicFileUploadButton
          onChange={(newUrl) => {
            setAnchorEl(null);
            onChange && onChange(newUrl);
          }}
        />
      </div>
    </Tooltip>
  );
}
