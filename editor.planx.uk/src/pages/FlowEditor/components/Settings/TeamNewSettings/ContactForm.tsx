import React from "react";
import EditorRow from "ui/editor/EditorRow";

export default function ContactForm(props: { type: string }) {
  return <EditorRow background children={<div>{props.type}</div>} />;
}
