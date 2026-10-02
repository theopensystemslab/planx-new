import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ComponentType } from "@opensystemslab/planx-core/types";
import { COMPONENT_TITLES } from "@planx/components/shared/componentTitles";
import { ICONS } from "@planx/components/shared/icons";
import { Icon } from "ui/icons/Icon";

interface Props {
  type: ComponentType;
  children?: React.ReactNode;
}

export default function ComponentTypeHeader({
  type,
  children,
}: Props): FCReturn {
  const componentIcon = ICONS[type];
  const title = COMPONENT_TITLES[type];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {componentIcon && (
        <Icon
          icon={componentIcon}
          sx={{ color: "text.primary", fontSize: "1.6rem" }}
        />
      )}
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      {children}
    </Box>
  );
}
