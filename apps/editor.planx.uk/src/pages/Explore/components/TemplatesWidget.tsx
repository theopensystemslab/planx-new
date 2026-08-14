import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React, { useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";

import { TemplateDetailsModal } from "./TemplateDetailsModal";
import { TemplateListItem } from "./TemplateListItem";
import type { Template } from "./types";

interface TemplatesWidgetProps {
  templates?: Template[];
  loading?: boolean;
}

export function TemplatesWidget({
  templates,
  loading = false,
}: TemplatesWidgetProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

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
    <>
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
            <TemplateListItem
              template={template}
              onClick={setSelectedTemplate}
            />
          </React.Fragment>
        ))}
      </List>
      {selectedTemplate && (
        <TemplateDetailsModal
          template={selectedTemplate}
          open={Boolean(selectedTemplate)}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </>
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
      summary
      team {
        name
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
