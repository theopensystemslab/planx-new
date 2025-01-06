import React from "react";

import {
  BaseOptionsEditor,
  BaseOptionsEditorProps,
} from "../shared/BaseOptionsEditor";

const QuestionOptionsEditor: React.FC<BaseOptionsEditorProps> = ({
  value,
  schema,
  onChange,
  showValueField = false,
}) => {
  return (
    <BaseOptionsEditor
      value={value}
      schema={schema}
      onChange={onChange}
      showValueField={showValueField}
      showDescriptionField={true}
    />
  );
};

export default QuestionOptionsEditor;
