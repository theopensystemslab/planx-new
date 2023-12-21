import MoreVert from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useState } from "react";

interface Props {
  className?: string;
  items: Array<{
    label: string;
    disabled?: boolean;
    error?: boolean;
    onClick: () => void;
  }>;
}

export default function SimpleMenu({ items, ...restProps }: Props): FCReturn {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  return (
    <div {...restProps}>
      <IconButton
        color="inherit"
        onClick={(ev) => {
          setAnchorEl(ev.currentTarget);
        }}
        aria-label="Options"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            style={item.error ? { color: "red" } : {}}
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              setAnchorEl(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
