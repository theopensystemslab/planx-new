import Box from "@mui/material/Box";
import { Meta, StoryObj } from "@storybook/react";
import {
  formatDate,
  getFlowNamesForFilter,
} from "pages/PlatformAdminPanel/utils";
import React from "react";
import type { AdminPanelData, LiveFlow } from "types";

import { DataTable } from "./DataTable";
import { mockTeams } from "./mockTeams";
import { ColumnFilterType, type DataGridProps } from "./types";

type TableStoryProps = DataGridProps<AdminPanelData>;

const meta = {
  title: "Design System/Atoms/Data table",
  component: DataTable,
  decorators: [
    (Story) => (
      <Box sx={{ height: "500px" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<TableStoryProps>;

export default meta;

type Story = StoryObj<TableStoryProps>;

const liveFlowNameValueOptions = getFlowNamesForFilter(mockTeams);

export const Basic: Story = {
  args: {
    rows: mockTeams,
    columns: [
      {
        field: "name",
        headerName: "Team",
      },
      {
        field: "referenceCode",
        headerName: "Reference code",
      },
      {
        field: "liveFlowsNames" as keyof AdminPanelData,
        headerName: "Live services",
        width: 450,
        type: ColumnFilterType.ARRAY,
        columnOptions: {
          valueGetter: (_value: LiveFlow[], row: AdminPanelData) =>
            row.liveFlows?.map(({ name }) => name),
          valueOptions: liveFlowNameValueOptions,
          sortable: false,
        },
      },
      {
        field: "liveFlowsDates" as keyof AdminPanelData,
        headerName: "First online at",
        type: ColumnFilterType.ARRAY,
        columnOptions: {
          valueGetter: (_value: LiveFlow[], row: AdminPanelData) =>
            row.liveFlows?.map(({ firstOnlineAt }) =>
              formatDate(firstOnlineAt),
            ),
          filterable: false,
          sortable: false,
        },
      },
      {
        field: "planningDataEnabled",
        headerName: "Planning constraints",
        type: ColumnFilterType.BOOLEAN,
      },
      {
        field: "govpayEnabled",
        headerName: "GOV.UK Pay",
        type: ColumnFilterType.BOOLEAN,
      },
      {
        field: "logo",
        headerName: "Logo",
        type: ColumnFilterType.BOOLEAN,
      },
    ],
  },
};
