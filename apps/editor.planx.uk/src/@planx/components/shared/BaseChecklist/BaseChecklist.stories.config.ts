import type { ConditionalOption, Option } from "@planx/components/Option/model";
import type { ResponsiveChecklistWithOptions } from "@planx/components/ResponsiveChecklist/model";
import { merge } from "lodash";

import { ChecklistWithOptions } from "../../Checklist/model";
import { Condition } from "../RuleBuilder/types";
import { type PublicProps } from "../types";
import { mockWithRepeatedOptions } from "./Public/tests/mockOptions";

export const toConditionalOption = (opt: Option): ConditionalOption =>
  merge(opt, {
    data: { rule: { condition: Condition.AlwaysRequired as const } },
  });

export const basicArgs: PublicProps<ChecklistWithOptions> = {
  text: "List the changes involved in the project",
  description: "Select only as many as you need to describe the project.",
  howMeasured:
    "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
  options: [
    { id: "a", data: { val: "a", text: "Repair windows or doors" } },
    { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
    { id: "c", data: { val: "c", text: "Install a swimming pool" } },
  ],
  allRequired: false,
};

export const basicResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...basicArgs,
    options: basicArgs.options.map(toConditionalOption),
  };

export const groupedArgs: PublicProps<ChecklistWithOptions> = {
  text: "List the changes involved in the project",
  description: "Select only as many as you need to describe the project.",
  howMeasured:
    "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
  groupedOptions: [
    {
      title: "Windows, doors and shopfronts",
      children: [
        { id: "a", data: { val: "a", text: "Repair windows or doors" } },
        { id: "b", data: { val: "b", text: "Add or alter shutters" } },
      ],
    },
    {
      title: "Garden and outdoors",
      children: [
        { id: "c", data: { val: "c", text: "Changes to trees or hedges" } },
        { id: "d", data: { val: "d", text: "Install a swimming pool" } },
        {
          id: "e",
          data: {
            val: "e",
            text: "Changes to a public road, pavement or path (including drop kerb)",
          },
        },
      ],
    },
  ],
};

export const groupedArgsResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...groupedArgs,
    groupedOptions: groupedArgs.groupedOptions.map((group) => ({
      ...group,
      children: group.children.map(toConditionalOption),
    })),
  };

export const withDescriptionsArgs: PublicProps<ChecklistWithOptions> = {
  text: "List the changes involved in the project",
  description: "Select only as many as you need to describe the project.",
  howMeasured:
    "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
  options: [
    { id: "a", data: { val: "a", text: "Repair windows or doors" } },
    {
      id: "b",
      data: {
        val: "b",
        text: "Changes to trees or hedges",
        description:
          "This includes trimming, fully removing, and planting new trees or hedges.",
      },
    },
    {
      id: "c",
      data: {
        val: "c",
        text: "Install a swimming pool",
        description:
          "This option alone does not include any outbuildings, fences, or landscaping.",
      },
    },
  ],
  allRequired: false,
};

export const withDescriptionsResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...withDescriptionsArgs,
    options: withDescriptionsArgs.options.map(toConditionalOption),
  };

export const withImagesArgs: PublicProps<ChecklistWithOptions> = {
  text: "What do you want to do to the roof?",
  description: "Select all that apply",
  options: [
    {
      id: "a",
      data: {
        val: "a",
        text: "Add dormers",
        img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/0pyd8i7c/4.4_roof-extensions_SemiD_Roof_extensiontype_reardormer.svg",
      },
    },
    {
      id: "b",
      data: {
        val: "b",
        text: "Convert a hip roof to a gable",
        img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/2mlyvlia/4.4_roof-extensions_SemiD_Roof_extensiontype_hiptogable.svg",
      },
    },
    {
      id: "c",
      data: {
        val: "c",
        text: "Add a storey",
        img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/5oqr1hne/4.4_roof-extensions_SemiD_Roof_extensiontype_addstorey.svg",
      },
    },
  ],
};

export const withImagesResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...withImagesArgs,
    options: withImagesArgs.options.map(toConditionalOption),
  };

export const exclusiveOrArgs: PublicProps<ChecklistWithOptions> = {
  text: "List the changes involved in the project",
  description: "Select only as many as you need to describe the project.",
  howMeasured:
    "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
  options: [
    { id: "a", data: { val: "a", text: "Repair windows or doors" } },
    { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
    { id: "c", data: { val: "c", text: "Install a swimming pool" } },
    {
      id: "none",
      data: { val: "none", text: "None of the above", exclusive: true },
    },
  ],
  allRequired: false,
};

export const exclusiveOrResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...exclusiveOrArgs,
    options: exclusiveOrArgs.options.map(toConditionalOption),
  };

export const allRequiredArgs: PublicProps<ChecklistWithOptions> = {
  text: "I confirm that:",
  description: "",
  options: [
    {
      id: "agree",
      data: {
        text: "The information contained in this application is truthful, accurate and complete, to the best of my knowledge",
      },
    },
  ],
  allRequired: true,
};

export const allRequiredResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...allRequiredArgs,
    options: allRequiredArgs.options.map(toConditionalOption),
  };

export const withRepeatedOptionsArgs: PublicProps<ChecklistWithOptions> =
  mockWithRepeatedOptions;

export const withRepeatedOptionsResponsiveArgs: PublicProps<ResponsiveChecklistWithOptions> =
  {
    ...withRepeatedOptionsArgs,
    groupedOptions: withRepeatedOptionsArgs.groupedOptions.map((group) => ({
      ...group,
      children: group.children.map(toConditionalOption),
    })),
  };
