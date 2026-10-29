import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

export const CopyButton = (props: { value: string; isActive: boolean }) => {
  const [copyMessage, setCopyMessage] = useState<"copy" | "copied">("copy");
  return (
    <Button
      disabled={!props.isActive}
      variant="help"
      onMouseLeave={() => {
        setTimeout(() => {
          setCopyMessage("copy");
        }, 500);
      }}
      onClick={() => {
        setCopyMessage("copied");
        navigator.clipboard.writeText(props.value);
      }}
      sx={{ marginLeft: 0.5 }}
    >
      <ContentCopyIcon style={{ width: "18px", height: "18px" }} />
      <Typography sx={{ ml: 0.5 }} variant="body3">
        {copyMessage}
      </Typography>
    </Button>
  );
};
