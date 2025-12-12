import type { GovUKPayment } from "@opensystemslab/planx-core/types";
import { Meta, StoryObj } from "@storybook/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Confirmation from "./Public";

const meta = {
  title: "PlanX Components/Confirmation",
  component: Confirmation,
} satisfies Meta<typeof Confirmation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    heading: "Form sent",
    description: `A payment receipt has been emailed to you. You will also 
    receive an email to confirm when your form has been received.`,
    nextSteps: [
      { title: "Validation", description: "Something will be validated" },
      { title: "Site visit", description: "Someone will visit" },
      { title: "Decision", description: "Something will be decided" },
    ],
    moreInfo: `
    ## You will be contacted
    - if there is anything missing from the information you have provided so far
    - if any additional information is required
    - to arrange a site visit, if required`,
    contactInfo: `
      You can contact us at <em>ADD YOUR COUNCIL CONTACT</em>
      <br><br>
      <p>What did you think of this service? Please give us your feedback on the next page.</p>
    `,
  },
  decorators: [
    (Story) => {
      useStore.setState({
        sessionId: '123-t3st-456',
        flowName: 'Apply for a Certificate of Lawfulness',
        govUkPayment: {
          payment_id: 'qe817o3kds9474rfkfldfHSK874JB',
          created_date: new Date('2024-01-15').toISOString(),
        } as GovUKPayment,
        computePassport: () => ({
          data: {
            _address: {
              title: '45, Greenfield Road, London SE22 7FF',
            },
            'application.type': 'ldc.proposed',
          },
        }),
      });

      return <Story />;
    },
  ],
} satisfies Story;

export const WithEditor = () => (
  <Wrapper Editor={Editor} Public={Confirmation} />
);
