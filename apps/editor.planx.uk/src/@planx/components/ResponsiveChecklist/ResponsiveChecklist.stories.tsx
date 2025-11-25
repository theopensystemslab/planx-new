import { ComponentType } from "@opensystemslab/planx-core/types";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import {
  allRequiredResponsiveArgs,
  basicResponsiveArgs,
  exclusiveOrResponsiveArgs,
  groupedArgs,
  withRepeatedOptionsResponsiveArgs,
} from "../shared/BaseChecklist/BaseChecklist.stories.config";
import {
  withDescriptionsResponsiveArgs,
  withImagesResponsiveArgs,
} from "../shared/BaseQuestion/BaseQuestion.stories.config";
import { EditorProps, type PublicProps } from "../shared/types";
import Editor from "./Editor";
import { ResponsiveChecklistWithOptions } from "./model";
import ResponsiveChecklist from "./Public";

const meta = {
  title: "PlanX Components/Responsive Checklist",
  component: ResponsiveChecklist,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof ResponsiveChecklist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: basicResponsiveArgs,
} satisfies Story;

export const Grouped = {
  args: groupedArgs as PublicProps<ResponsiveChecklistWithOptions>,
} satisfies Story;

export const WithDescriptions = {
  args: withDescriptionsResponsiveArgs,
} satisfies Story;

export const WithImages = {
  args: withImagesResponsiveArgs,
} satisfies Story;

export const ExclusiveOr = {
  args: exclusiveOrResponsiveArgs,
} satisfies Story;

export const AllRequired = {
  args: allRequiredResponsiveArgs,
} satisfies Story;

export const WithRepeatedOptions = {
  args: withRepeatedOptionsResponsiveArgs,
} satisfies Story;

const EditorWithFlatOptions = (
  props: EditorProps<
    ComponentType,
    ResponsiveChecklistWithOptions,
    Record<string, unknown>
  >,
) => {
  const editorProps: ResponsiveChecklistWithOptions = {
    ...props,
    groupedOptions: undefined,
    options: [],
  };

  return <Editor {...editorProps} />;
};

export const WithEditor = () => {
  return (
    <Wrapper Editor={EditorWithFlatOptions} Public={ResponsiveChecklist} />
  );
};
