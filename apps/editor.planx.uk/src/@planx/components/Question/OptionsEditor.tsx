import React from "react";
import { EditorProps } from "ui/editor/ListManager/ListManager";

import { ConditionalOption, Option } from "../Option/model";
import { BaseOptionsEditor } from "../shared/BaseOptionsEditor";
import { OptionEditor } from "../shared/BaseOptionsEditor/types";

const QuestionOptionsEditor: React.FC<
  EditorProps<Option | ConditionalOption> | OptionEditor
> = (props) => {
  // Type-narrowing only, type will always be present
  if (!("type" in props))
    throw Error("Type must be provide for BaseOptionsEditor");

  return (
    <BaseOptionsEditor
      {...props}
      showValueField={Boolean(props.showValueField)}
      showDescriptionField
    />
  );
};

export default QuestionOptionsEditor;
