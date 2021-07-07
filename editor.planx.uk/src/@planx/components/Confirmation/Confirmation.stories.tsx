import { Story } from "@storybook/react/types-6-0";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Confirmation, { Props } from "./Public";

export default {
  title: "PlanX Components/Confirmation",
  component: Confirmation,
};

const Template: Story<Props> = (args: Props) => <Confirmation {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  heading: "Application sent",
  description: `A payment receipt has been emailed to you. You will also 
  receive an email to confirm when your application has been received.`,
  color: { background: "rgba(1, 99, 96, 0.1)", text: "#000" },
  details: {
    "Planning Application Reference": "LBL–LDCP-2138261",
    "Property Address": "45, Greenfield Road, London SE22 7FF",
    "Application type":
      "Application for a Certificate of Lawfulness – Proposed",
    Submitted: new Date().toLocaleDateString("en-gb", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    "GOV.UK Payment reference": "qe817o3kds9474rfkfldfHSK874JB",
  },
  nextSteps: [
    { title: "Validation", description: "Something will be validated" },
    { title: "Site visit", description: "Someone will visit" },
    { title: "Decision", description: "Something will be decided" },
  ],
  moreInfo: `
  ## You will be contacted
  - if there is anything missing from the information you have provided so far
  - if any additional information is required
  - to arrange a site visit, if required
  - to inform you whether a certificate has been granted or not`,
  contactInfo: `You can contact us at **planning@lambeth.gov.uk**<br/>What did you think of this service? Please give us your feedback using the link in the footer below.`,
};

export const WithEditor = () => (
  <Wrapper Editor={Editor} Public={Confirmation} />
);
