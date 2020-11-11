import React from "react";
import InputField from "src/ui/InputField";

export default (
  <InputField
    autoFocus
    name="text"
    multiline={true}
    placeholder="Portal name"
    rows={2}
    disabled={false}
    required={false}
  />
);
