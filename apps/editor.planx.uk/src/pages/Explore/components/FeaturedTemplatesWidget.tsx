import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import React from "react";

import type { FeaturedTemplate } from "../hooks/useGetFeaturedTemplates";
import { useGetFeaturedTemplates } from "../hooks/useGetFeaturedTemplates";
import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";

interface FeaturedTemplatesWidgetProps {
  templates?: FeaturedTemplate[];
}

export function FeaturedTemplatesWidget({
  templates,
}: FeaturedTemplatesWidgetProps) {
  if (!templates?.length) {
    return (
      <Box sx={{ px: 2, py: 1.25 }}>
        <Typography variant="body2" color="textSecondary">
          No featured templates are currently available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ overflowY: "auto" }}>
        {templates.map(({ id, name, summary }, index) => (
          <React.Fragment key={id}>
            {index === 0 && <Divider />}
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Badge variant={BadgeVariant.SourceTemplate} size="compact" />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {name}
                </Typography>
                {summary && (
                  <Typography variant="body2" color="textSecondary">
                    {summary}
                  </Typography>
                )}
              </Box>
            </Box>
            {index < templates.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default function ConnectedFeaturedTemplatesWidget() {
  const { data } = useGetFeaturedTemplates();

  return <FeaturedTemplatesWidget templates={data?.templates} />;
}
