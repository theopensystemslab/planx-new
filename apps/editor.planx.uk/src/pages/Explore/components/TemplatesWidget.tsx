import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { EmptyState } from "ui/editor/EmptyState";

import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";
import { SearchListItem } from "./SearchListItem";
import type { Template } from "./types";

interface TemplatesWidgetProps {
  templates?: Template[];
  loading?: boolean;
}

export function TemplatesWidget({
  templates,
  loading = false,
}: TemplatesWidgetProps) {
  const [teamSlug, canUserEditTeam] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
  ]);

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
      {templates.map((template, index) => {
        const isSubscribed =
          canUserEditTeam(teamSlug) && Boolean(template.subscription?.length);

        return (
          <React.Fragment key={template.id}>
            {index > 0 && <Divider sx={{ borderColor: "border.main" }} />}
            <SearchListItem
              icon={<Badge variant={BadgeVariant.SourceTemplate} />}
              title={template.name}
              description={template.summary}
              statusLabel={isSubscribed ? "Subscribed" : undefined}
            />
          </React.Fragment>
        );
      })}
    </List>
  );
}

const GET_ONLINE_SOURCE_TEMPLATES = gql`
  query GetOnlineSourceTemplates($teamId: Int!) {
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
        id
      }
      subscription: templated_flows(
        where: { team_id: { _eq: $teamId } }
        limit: 1
      ) {
        id
      }
    }
  }
`;

export default function ConnectedTemplatesWidget() {
  const teamId = useStore((state) => state.teamId);
  const { data, loading } = useQuery<{ templates: Template[] }>(
    GET_ONLINE_SOURCE_TEMPLATES,
    { variables: { teamId } },
  );

  return <TemplatesWidget templates={data?.templates} loading={loading} />;
}
