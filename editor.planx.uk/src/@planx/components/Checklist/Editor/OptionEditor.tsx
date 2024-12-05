import {
  BaseOptionEditor,
  BaseOptionEditorProps,
} from "@planx/components/shared/BaseOptionsEditor";
import React from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

export type ChecklistOptionEditorProps = BaseOptionEditorProps & {
  index: number;
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
  showValueField?: boolean;
};

const ChecklistOptionEditor: React.FC<ChecklistOptionEditorProps> = ({
  value,
  onChange,
  showValueField = false,
  groups,
  onMoveToGroup,
  index,
}) => {
  return (
    <BaseOptionEditor
      value={value}
      onChange={onChange}
      showValueField={showValueField}
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
    </BaseOptionEditor>
  );
};

export default ChecklistOptionEditor;
