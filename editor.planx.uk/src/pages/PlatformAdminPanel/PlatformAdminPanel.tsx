import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnType } from "ui/shared/DataTable/types";

import {
  False as NotConfigured,
  True as Configured,
} from "../../ui/shared/DataTable/components/cellIcons";
import { Article4Status } from "./components/Article4Status";

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

  const filteredPanelData = adminPanelData?.filter(isCouncilTeam);

  const liveFlowValueOptions = [
    ...new Set(filteredPanelData?.flatMap((teamData) => teamData.liveFlows)),
  ];
  console.log;

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
      type: ColumnType.ARRAY,
      columnOptions: {
        valueOptions: liveFlowValueOptions,
      },
    },
    {
      field: "planningDataEnabled",
      headerName: "Planning constraints",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "article4sEnabled",
      headerName: "Article 4s (API)",
      type: ColumnType.BOOLEAN,
      customComponent: (params) => {
        return <Article4Status teamSlug={params.row.slug} />;
      },
    },
    {
      field: "govpayEnabled",
      headerName: "GOV.UK Pay",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "govnotifyPersonalisation",
      headerName: "GOV.UK Notify",
      type: ColumnType.BOOLEAN,
      customComponent: (params) => {
        return params.value?.helpEmail ? <Configured /> : <NotConfigured />;
      },
    },
    {
      field: "sendToEmailAddress",
      headerName: "Send to email",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "bopsSubmissionURL",
      headerName: "BOPS",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "powerAutomateEnabled",
      headerName: "Power automate",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "subdomain",
      headerName: "Subdomain",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "logo",
      headerName: "Logo",
      type: ColumnType.BOOLEAN,
    },
    {
      field: "favicon",
      headerName: "Favicon",
      type: ColumnType.BOOLEAN,
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
