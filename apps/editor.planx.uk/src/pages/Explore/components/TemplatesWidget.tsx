import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { EmptyState } from "ui/editor/EmptyState";

import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";

export interface Template {
  id: string;
  name: string;
  slug: string;
  summary: string;
  team: {
    slug: string;
  };
}

interface TemplatesWidgetProps {
  templates?: Template[];
  loading?: boolean;
}

export function TemplatesWidget({
  templates,
  loading = false,
}: TemplatesWidgetProps) {
  if (loading) {
    return (
      <List
        disablePadding
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
      </List>
    );
  }

  if (!templates?.length) {
    return (
      <Box sx={{ p: 2 }}>
        <EmptyState
          size="small"
          title="No templates available"
          description="Source templates will appear here once published"
        />
      </Box>
    );
  }

  return (
    <List
      disablePadding
      sx={{
        overflowY: "auto",
        flex: 1,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {templates.map((template, index) => (
        <React.Fragment key={template.id}>
          {index > 0 && <Divider sx={{ borderColor: "border.main" }} />}
          <ListItem sx={{ position: "relative", px: 2, py: 1.5, gap: 1.5 }}>
            <Link
              to="/app/$team/$flow"
              params={{ team: template.team.slug, flow: template.slug }}
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
              aria-label={template.name}
            />
            <Badge variant={BadgeVariant.SourceTemplate} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {template.name}
              </Typography>
              {template.summary && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {template.summary}
                </Typography>
              )}
            </Box>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
}

const GET_ONLINE_SOURCE_TEMPLATES = gql`
  query GetOnlineSourceTemplates {
    templates: flows(
      where: {
        is_template: { _eq: true }
        can_create_from_copy: { _eq: true }
        archived_at: { _is_null: true }
      }
      order_by: { name: asc }
    ) {
      id
      name
      slug
      summary
      team {
        slug
      }
    }
  }
`;

export default function ConnectedTemplatesWidget() {
  const { data, loading } = useQuery<{ templates: Template[] }>(
    GET_ONLINE_SOURCE_TEMPLATES,
  );

  return <TemplatesWidget templates={data?.templates} loading={loading} />;
}
