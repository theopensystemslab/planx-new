import { Meta, StoryObj } from "@storybook/react";

import { DataTable } from "./DataTable";
import { ColumnType } from "./types";

const meta = {
  title: "Design System/Atoms/Data table",
  component: DataTable,
} satisfies Meta<typeof DataTable>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    rows: [
      {
        id: 1,
        name: "Barking and Dagenham",
        referenceCode: "BDD",
        liveFlows: [
          "Find out if you need planning permission",
          "Apply for prior approval",
          "Barking draft 2",
        ],
        planningDataEnabled: false,
        govpayEnabled: true,
        logo: true,
      },
      {
        id: 2,
        name: "Doncaster",
        referenceCode: "DON",
        liveFlows: [
          "Notify completion of planning application",
          "Find out if you need planning permission",
          "Apply for prior approval",
          "Apply for service declarations",
          "Article4",
        ],
        planningDataEnabled: true,
        govpayEnabled: true,
        logo: true,
      },
      {
        id: 3,
        name: "Newcastle",
        referenceCode: "NCL",
        liveFlows: [
          "Confirmation pages",
          "Find out if you need planning permission",
          "Listed building pre application advice",
          "Apply for prior approval",
          "Apply for service declarations",
          "Article4",
          "Apply for a lawful development certificate",
        ],
        planningDataEnabled: false,
        govpayEnabled: false,
        logo: true,
      },
      {
        id: 4,
        name: "Tewkesbury",
        referenceCode: "TWK",
        liveFlows: [
          "Listed building pre application advice",
          "Apply for service declarations",
          "Article4",
          "Apply for a lawful development certificate",
        ],
        planningDataEnabled: false,
        govpayEnabled: true,
        logo: false,
      },
    ],
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
        field: "liveFlows",
        headerName: "Live services",
        width: 450,
        type: ColumnType.ARRAY,
      },
      {
        field: "planningDataEnabled",
        headerName: "Planning constraints",
        type: ColumnType.BOOLEAN,
      },
      {
        field: "govpayEnabled",
        headerName: "GOV.UK Pay",
        type: ColumnType.BOOLEAN,
      },
      {
        field: "logo",
        headerName: "Logo",
        type: ColumnType.BOOLEAN,
      },
    ],
  },
} satisfies Story;
