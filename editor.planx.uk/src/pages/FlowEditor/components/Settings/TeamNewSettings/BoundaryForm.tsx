import React, { ChangeEvent, useState } from "react";
import { eventManager } from "react-toastify/dist/core";
import EditorRow from "ui/editor/EditorRow";
import RichTextInput from "ui/editor/RichTextInput";

export default function BoundaryForm() {
  const [boundaryState, setBoundaryState] = useState("");
  return (
    <EditorRow
      background
      children={
        <>
          <h4>Homepage and Planning Portal</h4>
          <RichTextInput
            name="homepage"
            value={boundaryState}
            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
              setBoundaryState(ev.target.value);
            }}
            placeholder="homepage"
          />
        </>
      }
    />
  );
}
