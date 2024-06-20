import React from "react";
import EditorRow from "ui/editor/EditorRow";
import RichTextInput from "ui/editor/RichTextInput";
export default function HomepagePlanningForm() {
  return (
    <EditorRow
      background
      children={
        <>
          <h4>Homepage and Planning Portal</h4>
          <RichTextInput />
        </>
      }
    />
  );
}
