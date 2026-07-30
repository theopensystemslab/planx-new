import type { Meta, StoryObj } from "@storybook/tanstack-react";

import type { ServiceCharge } from "../types";
import { ServiceCharges } from "./ServiceCharges";

const serviceCharges: ServiceCharge[] = [
  {
    flowName: "Apply for a lawful development certificate",
    sessionId: "session-1",
    paymentId: "payment-1",
    amount: 100,
    paidAt: "2025-04-15T12:00:00.000Z",
    month: 4,
    monthText: "April",
    quarter: 1,
    fiscalYear: 2025,
  },
  {
    flowName: "Report a planning breach",
    sessionId: "session-2",
    paymentId: "payment-2",
    amount: 120,
    paidAt: "2025-08-15T12:00:00.000Z",
    month: 8,
    monthText: "August",
    quarter: 2,
    fiscalYear: 2025,
  },
  {
    flowName: "Apply for prior approval",
    sessionId: "session-3",
    paymentId: "payment-3",
    amount: 150,
    paidAt: "2025-11-15T12:00:00.000Z",
    month: 11,
    monthText: "November",
    quarter: 3,
    fiscalYear: 2025,
  },
  {
    flowName: "Apply for a lawful development certificate",
    sessionId: "session-4",
    paymentId: "payment-4",
    amount: 90,
    paidAt: "2026-01-15T12:00:00.000Z",
    month: 1,
    monthText: "January",
    quarter: 4,
    fiscalYear: 2025,
  },
  {
    flowName: "Apply for prior approval",
    sessionId: "session-5",
    paymentId: "payment-5",
    amount: 110,
    paidAt: "2024-05-15T12:00:00.000Z",
    month: 5,
    monthText: "May",
    quarter: 1,
    fiscalYear: 2024,
  },
  {
    flowName: "Report a planning breach",
    sessionId: "session-6",
    paymentId: "payment-6",
    amount: 130,
    paidAt: "2024-09-15T12:00:00.000Z",
    month: 9,
    monthText: "September",
    quarter: 2,
    fiscalYear: 2024,
  },
  {
    flowName: "Apply for a lawful development certificate",
    sessionId: "session-7",
    paymentId: "payment-7",
    amount: 140,
    paidAt: "2025-02-15T12:00:00.000Z",
    month: 2,
    monthText: "February",
    quarter: 4,
    fiscalYear: 2024,
  },
  {
    flowName: "Apply for prior approval",
    sessionId: "session-8",
    paymentId: "payment-8",
    amount: 95,
    paidAt: "2023-06-15T12:00:00.000Z",
    month: 6,
    monthText: "June",
    quarter: 1,
    fiscalYear: 2023,
  },
  {
    flowName: "Report a planning breach",
    sessionId: "session-9",
    paymentId: "payment-9",
    amount: 125,
    paidAt: "2023-10-15T12:00:00.000Z",
    month: 10,
    monthText: "October",
    quarter: 3,
    fiscalYear: 2023,
  },
];

const meta = {
  title: "Editor Components/Subscription/ServiceCharges",
  component: ServiceCharges,
} satisfies Meta<typeof ServiceCharges>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleYear: Story = {
  args: {
    serviceCharges: serviceCharges.filter((sc) => sc.fiscalYear === 2025),
  },
};

export const MultipleYears: Story = {
  args: {
    serviceCharges,
  },
};

export const Empty: Story = {
  args: {
    serviceCharges: [],
  },
};
