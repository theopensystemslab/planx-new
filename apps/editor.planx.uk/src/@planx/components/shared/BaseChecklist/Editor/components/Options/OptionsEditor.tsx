import { Option } from "@planx/components/Option/model";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import { OptionEditor } from "@planx/components/shared/BaseOptionsEditor/types";
import React from "react";
import { EditorProps } from "ui/editor/ListManager/ListManager";
import SimpleMenu from "ui/editor/SimpleMenu";

type ChecklistOptionsEditorProps = EditorProps<Option> | OptionEditor;

export type Props = ChecklistOptionsEditorProps & {
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
};

const ChecklistOptionsEditor: React.FC<Props> = (props) => {
  const { groups, onMoveToGroup, index } = props;

  // Type-narrowing only, type will always be present
  if (!("type" in props))
    throw Error("Type must be provide for BaseOptionsEditor");

  return (
    <BaseOptionsEditor {...props} showDescriptionField={true}>
      {typeof index !== "undefined" && groups && onMoveToGroup && (
        <SimpleMenu
          items={groups.map((group, groupIndex) => ({
            label: `Move to ${group || `group ${groupIndex}`}`,
            onClick: () => {
              if (onMoveToGroup && typeof index === "number")
                onMoveToGroup(index, groupIndex);
            },
            disabled: groupIndex === groupIndex,
          }))}
        />
      )}
    </BaseOptionsEditor>
  );
};

export default ChecklistOptionsEditor;
