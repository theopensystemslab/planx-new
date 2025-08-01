import {
  BaseOptionsEditor,
  BaseOptionsEditorProps,
} from "@planx/components/shared/BaseOptionsEditor";
import React from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

export type ChecklistOptionsEditorProps = BaseOptionsEditorProps & {
  index: number;
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
  showValueField?: boolean;
  disabled?: boolean;
};

const ChecklistOptionsEditor: React.FC<ChecklistOptionsEditorProps> = ({
  value,
  schema,
  onChange,
  showValueField = false,
  groups,
  onMoveToGroup,
  index,
  disabled,
}) => {
  return (
    <BaseOptionsEditor
      value={value}
      schema={schema}
      onChange={onChange}
      showValueField={showValueField}
      showDescriptionField={true}
      disabled={disabled}
      index={index}
    >
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
