import { MockedProvider } from "@apollo/client/testing";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { useStore } from "../../../lib/store";
import { mockSubmissionEvents, teamData } from "../mockSubmissionsGrouped";
import { GET_TEAM_LOGO } from "../queries";
import SubmissionDetailContent from "./SubmissionDetailContent";
import { GET_SUBMISSION_EVENTS } from "./SubmissionDetailContent";

const mocks = [
  {
    request: {
      query: GET_SUBMISSION_EVENTS,
      variables: { sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" },
    },
    result: {
      data: {
        submissions: mockSubmissionEvents,
      },
    },
  },
  {
    request: {
      query: GET_TEAM_LOGO,
      variables: { teamSlug: "test-council" },
    },
    result: {
      data: teamData,
    },
  },
];

const meta = {
  title: "Editor Components/Submissions/Submission detail content",
  component: SubmissionDetailContent,
  decorators: [
    (Story) => {
      useStore.setState({ teamSlug: "test-council" });

      return (
        <MockedProvider mocks={mocks} addTypename={false}>
          <Box>
            <Story />
          </Box>
        </MockedProvider>
      );
    },
  ],
} satisfies Meta<typeof SubmissionDetailContent>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  },
} satisfies Story;
