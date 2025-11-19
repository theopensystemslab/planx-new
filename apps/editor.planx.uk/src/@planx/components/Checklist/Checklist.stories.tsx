import { ComponentType } from "@opensystemslab/planx-core/types";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import {
  allRequiredArgs,
  basicArgs,
  exclusiveOrArgs,
  groupedArgs,
  withDescriptionsArgs,
  withImagesArgs,
  withRepeatedOptionsArgs,
} from "../shared/BaseChecklist/BaseChecklist.stories.config";
import { mockWithRepeatedOptions } from "../shared/BaseChecklist/Public/tests/mockOptions";
import { EditorProps } from "../shared/types";
import Editor from "./Editor";
import { ChecklistWithOptions } from "./model";
import Checklist from "./Public";

const meta = {
  title: "PlanX Components/Checklist",
  component: Checklist,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Checklist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: basicArgs,
} satisfies Story;

export const Grouped = {
  args: groupedArgs,
} satisfies Story;

export const WithDescriptions = {
  args: withDescriptionsArgs,
} satisfies Story;

export const WithImages = {
  args: withImagesArgs,
} satisfies Story;

export const ExclusiveOr = {
  args: exclusiveOrArgs,
} satisfies Story;

export const AllRequired = {
  args: allRequiredArgs,
} satisfies Story;

export const WithRepeatedOptions = {
  args: withRepeatedOptionsArgs,
} satisfies Story;

const EditorWithFlatOptions = (
  props: EditorProps<
    ComponentType,
    ChecklistWithOptions,
    Record<string, unknown>
  >,
) => {
  const editorProps: ChecklistWithOptions = {
    ...props,
    groupedOptions: undefined,
    options: [],
  };

  return <Editor {...editorProps} />;
};

export const WithEditor = () => {
  return <Wrapper Editor={EditorWithFlatOptions} Public={Checklist} />;
};
