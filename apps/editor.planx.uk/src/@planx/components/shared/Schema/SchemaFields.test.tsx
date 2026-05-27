import { FormikProps } from "formik";
import { setup } from "test/utils";

import { Schema, SchemaUserData } from "./model";
import { SchemaFields } from "./SchemaFields";

const simpleSchema: Schema = {
  type: "Test",
  fields: [
    {
      type: "text",
      required: true,
      data: { title: "Description", fn: "referenceDescription" },
    },
  ],
  min: 2,
};

const mockFormik = {
  values: { schemaData: [] },
  errors: {},
} as unknown as FormikProps<SchemaUserData>;

it("renders nothing when activeIndex is out of bounds for schemaData", async () => {
  const { queryByLabelText } = await setup(
    <SchemaFields schema={simpleSchema} formik={mockFormik} activeIndex={0} />,
  );
  expect(queryByLabelText("Description")).not.toBeInTheDocument();
});
