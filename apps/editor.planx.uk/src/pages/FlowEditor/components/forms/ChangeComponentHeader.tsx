import Link from "@mui/material/Link";
import Popover from "@mui/material/Popover";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import ComponentTypeHeader from "ui/editor/ComponentTypeHeader";

import { fromSlug } from "../../data/types";
import { AddComponentModalContent } from "./AddComponentModal";

interface Props {
  type: string;
  onChange: (newType: TYPES) => void;
  canChange: boolean;
}

const ChangeComponentHeader: React.FC<Props> = ({
  type,
  onChange,
  canChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const componentType = fromSlug(type);

  const handleSelect = (slug: string) => {
    setAnchorEl(null);
    const newType = fromSlug(slug);
    if (newType !== undefined) onChange(newType);
  };

  if (!componentType) return null;

  return (
    <>
      <ComponentTypeHeader type={componentType}>
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
      </ComponentTypeHeader>
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
