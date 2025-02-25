import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";

import {
  False as NotConfigured,
  True as Configured,
} from "../../ui/shared/DataTable/components/cellIcons";
import { Article4Status } from "./components/Article4Status";
import { getFlowNamesForFilter } from "./getFlowNamesForFilter";

const isCouncilTeam = () => {
  const internalTeamNames = [
    "WikiHouse",
    "PlanX",
    "Open Systems Lab",
    "Testing",
    "Open Digital Planning",
    "Environment Agency",
    "Templates",
  ];
  return (team: AdminPanelData) => !internalTeamNames.includes(team.name);
};

export const PlatformAdminPanel = () => {
  const adminPanelData = useStore((state) => state.adminPanelData);

  const filteredPanelData = adminPanelData?.filter(isCouncilTeam());

  const liveFlowValueOptions = getFlowNamesForFilter(filteredPanelData!);

  const columns: ColumnConfig<AdminPanelData>[] = [
    {
      field: "name",
      headerName: "Team",
    },
    {
      field: "referenceCode",
      headerName: "Reference code",
    },

    {
      field: "liveFlows",
      headerName: "Live services",
      width: 450,
      type: ColumnFilterType.ARRAY,
      columnOptions: {
        valueOptions: liveFlowValueOptions,
        sortable: false,
      },
    },
    {
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "article4sEnabled",
      headerName: "Article 4s (API)",
      type: ColumnFilterType.BOOLEAN,
      customComponent: (params) => {
        return <Article4Status teamSlug={params.row.slug} />;
      },
    },
    {
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "govnotifyPersonalisation",
      headerName: "GOV.UK Notify",
      type: ColumnFilterType.BOOLEAN,
      customComponent: (params) => {
        return params.value?.helpEmail ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "sendToEmailAddress",
      headerName: "Send to email",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "subdomain",
      headerName: "Subdomain",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "logo",
      headerName: "Logo",
      type: ColumnFilterType.BOOLEAN,
    },
    {
      field: "favicon",
      headerName: "Favicon",
      type: ColumnFilterType.BOOLEAN,
    },
  ];

  return (
    <Container maxWidth={false}>
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform admin panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <strong>{import.meta.env.VITE_APP_ENV}</strong>
          {` environment.`}
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <DataTable rows={filteredPanelData} columns={columns} />
      </SettingsSection>
    </Container>
  );
};
