import Error from "@mui/icons-material/Error";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import React, { type FC, useState } from "react";

export const PopupError: FC<{ id: string; error: string }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <IconButton size="small" onClick={handleOpen}>
        <Error />
      </IconButton>
      <Popover
        id="popover"
        sx={{
          zIndex: 100_000,
          maxWidth: "xs",
          padding: 10,
        }}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Typography variant="body2" sx={{ padding: 1 }}>
          {props.error}
        </Typography>
      </Popover>
    </Box>
  );
};
