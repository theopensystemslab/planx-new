import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AdminPanelData } from "types";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";

import {
  False as NotConfigured,
  True as Configured,
} from "../../ui/shared/DataTable/components/cellIcons";
import { getFlowNamesForFilter } from "./utils";

export const PlatformAdminPanel = () => {
  const adminPanelData = useStore((state) => state.adminPanelData);

  const liveFlowValueOptions = adminPanelData
    ? getFlowNamesForFilter(adminPanelData)
    : [];

  const columns: ColumnConfig<AdminPanelData>[] = [
    {
      field: "name",
      headerName: "Team",
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: (params) => <strong>{`${params.value}`}</strong>,
      columnOptions: {
        // Allow filtering by unique team names
        valueOptions: [...new Set(adminPanelData?.map(({ name }) => name))],
      },
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
      headerName: "Article 4s",
      type: ColumnFilterType.BOOLEAN,
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
    {
      field: "isTrial",
      headerName: "Trial account",
      type: ColumnFilterType.BOOLEAN,
    },
  ];

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform admin panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <Typography component="span" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
            {import.meta.env.VITE_APP_ENV}
          </Typography>
          {` environment.`}
        </Typography>
      </SettingsSection>
      <DataTable rows={adminPanelData} columns={columns} />
    </FixedHeightDashboardContainer>
  );
};
