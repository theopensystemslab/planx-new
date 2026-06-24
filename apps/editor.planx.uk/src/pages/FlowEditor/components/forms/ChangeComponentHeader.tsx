import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import React, { useState } from "react";

import { fromSlug } from "../../data/types";
import { AddComponentModalContent } from "./AddComponentModal";
import { ALL_ITEMS } from "./componentData";

interface Props {
  type: string;
  onChange: (newType: TYPES) => void;
  canChange: boolean;
}

const ChangeComponentHeader: React.FC<Props> = ({ type, onChange, canChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const displaySlug = type === "enhanced-text-input" ? "text-input" : type;
  const item = ALL_ITEMS.find((i) => i.slug === displaySlug);
  const Icon = item ? ICONS[item.type] : undefined;
  const componentTitle = item?.title ?? type;

  const handleSelect = (slug: string) => {
    setAnchorEl(null);
    const newType = fromSlug(slug);
    if (newType !== undefined) onChange(newType);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {Icon && <Icon sx={{ color: "text.primary", fontSize: "1.6rem" }} />}
        <Typography variant="h3" component="h1">
          {componentTitle}
        </Typography>
        {canChange && (
          <Link
            component="button"
            variant="body2"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ flexShrink: 0 }}
          >
            change
          </Link>
        )}
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              width: 300,
              maxHeight: "min(480px, 85vh)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
            },
          },
        }}
      >
        <AddComponentModalContent onSelect={handleSelect} />
      </Popover>
    </>
  );
};

export default ChangeComponentHeader;
