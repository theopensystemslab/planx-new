import { screen, within } from "@testing-library/react";
import React, { useState } from "react";
import { setup } from "test/utils";

import { DataFieldAutocomplete } from "./DataFieldAutocomplete";

const schema = ["my.existing.field", "another.field"];

const StatefulDataFieldAutocomplete: React.FC<{
  onChange: (v: string | null) => void;
}> = ({ onChange }) => {
  const [value, setValue] = useState<string | undefined>("");
  return (
    <DataFieldAutocomplete
      schema={schema}
      value={value}
      onChange={(v) => {
        setValue(v ?? "");
        onChange(v);
      }}
    />
  );
};

it("auto-commits a typed value that exists in the schema when the input loses focus", async () => {
  const onChange = vi.fn();

  const { user } = await setup(
    <DataFieldAutocomplete schema={schema} value="" onChange={onChange} />,
  );

  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.paste("my.existing.field");
  await user.tab();

  expect(onChange).toHaveBeenCalledWith("my.existing.field");
});

it("auto-commits a new value when the input loses focus", async () => {
  const onChange = vi.fn();

  const { user } = await setup(
    <DataFieldAutocomplete schema={schema} value="" onChange={onChange} />,
  );

  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.paste("my.new.custom.field");
  await user.tab();

  expect(onChange).toHaveBeenCalledWith("my.new.custom.field");
});

it("does not commit when the input loses focus without a change", async () => {
  const onChange = vi.fn();

  const { user } = await setup(
    <DataFieldAutocomplete
      schema={schema}
      value="my.existing.field"
      onChange={onChange}
    />,
  );

  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.tab();

  expect(onChange).not.toHaveBeenCalled();
});

it("auto-commits a typed value after the field has been cleared", async () => {
  const onChange = vi.fn();

  const { user, container } = await setup(
    <StatefulDataFieldAutocomplete onChange={onChange} />,
  );

  // Type a value and blur to commit it
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.paste("my.existing.field");
  await user.tab();
  expect(onChange).toHaveBeenLastCalledWith("my.existing.field");

  // Clear the committed value
  const clearButton = within(container).getByTitle("Clear");
  await user.click(clearButton);
  expect(onChange).toHaveBeenLastCalledWith(null);

  // Type a new value and blur — this was the failing case
  await user.click(screen.getByRole("combobox"));
  await user.paste("another.field");
  await user.tab();
  expect(onChange).toHaveBeenLastCalledWith("another.field");
});
