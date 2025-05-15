import { TextInputType } from "@planx/components/TextInput/model";

import { PageSchema } from "../model";

export const MonitoringGLA: PageSchema = {
  type: "Monitoring questions",
  fields: [
    {
      type: "question",
      data: {
        title: "What is the current ownership status of the land?",
        fn: "property.ownership.status",
        options: [
          { id: "public", data: { text: "Public ownership", val: "public" } },
          {
            id: "private",
            data: { text: "Private ownership", val: "private" },
          },
          { id: "mixed", data: { text: "Mixed ownership", val: "mixed" } },
        ],
      },
    },
    {
      type: "question",
      required: false,
      data: {
        title: "Does the property have a lead Registered Social Landlord?",
        fn: "property.socialLandlord",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "If known, what is the title number of the property?",
        fn: "property.titleNumber",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title:
          "If known, what is the certificate number from the most recent Energy Performance Certificate?",
        fn: "property.EPC",
        type: TextInputType.Short,
      },
    },
    {
      type: "question",
      data: {
        title: "Is the development expected to be delivered in phases?",
        fn: "proposal.phased",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "If the development has a name, what is it?",
        fn: "proposal.name",
        type: TextInputType.Short,
      },
    },
    {
      type: "question",
      data: {
        title: "Has a lead developer been assigned to the project?",
        fn: "application.leadDeveloper",
        options: [
          {
            id: "ukCompany",
            data: {
              text: "Yes, a registered company in the UK",
              val: "ukCompany",
            },
          },
          {
            id: "overseasCompany",
            data: { text: "Yes, an overseas company", val: "overseasCompany" },
          },
          { id: "none", data: { text: "No", val: "none" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "How much will the project cost?",
        fn: "proposal.cost.projected",
        options: [
          {
            id: "twoMillion",
            data: { text: "Up to £2 million", val: "twoMillion" },
          },
          {
            id: "twoToHundredMillion",
            data: {
              text: "Between £2 million and £100 million",
              val: "twoToHundredMillion",
            },
          },
          {
            id: "moreThanHundredMillion",
            data: {
              text: "More than £100 million",
              val: "moreThanHundredMillion",
            },
          },
        ],
      },
    },
    {
      type: "question",
      data: {
        title:
          "Does this application replace or amend a previously granted planning permission?",
        fn: "application.linked.superseding",
        options: [
          {
            id: "full",
            data: { text: "Yes, an existing planning permission", val: "full" },
          },
          {
            id: "partial",
            data: {
              text: "Yes, part of an existing planning permission",
              val: "partial",
            },
          },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title:
          "Is this a fast track application for the purposes of affordable housing?",
        fn: "application.fastTrack.affordable",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
  ],
  min: 1,
  max: 1,
} as const;
