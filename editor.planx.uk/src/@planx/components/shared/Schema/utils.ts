import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import { convertNumberToText } from "@planx/components/List/utils";
import { useStore } from "pages/FlowEditor/lib/store";

import { FileUploadField, Schema, SchemaUserResponse } from "./model";

interface GetRequestedFilesArgs {
  schemaFn: string;
  schema: Schema;
  userData: SchemaUserResponse[];
  context: TYPES.List | TYPES.Page;
}

/**
 * Generate passport values describing requested files for this service
 * Returns existing data, amended with files requested by this List or Page component
 */
export const getRequestedFiles = ({
  schemaFn,
  schema,
  userData,
  context,
}: GetRequestedFilesArgs) => {
  const fileUploadFields = schema.fields.filter(
    (field): field is FileUploadField => field.type === "fileUpload",
  );

  const responseDataValues = getResponseDataValues({
    fileUploadFields,
    schemaFn,
    userData,
    context,
  });

  // Get current requested files state
  const { required, recommended, optional } = useStore
    .getState()
    .requestedFiles();

  // Return updated requested files state
  return {
    [PASSPORT_REQUESTED_FILES_KEY]: {
      required: [...required, ...responseDataValues.required],
      optional: [...optional, ...responseDataValues.optional],
      recommended,
    },
  };
};

const getResponseDataValues = ({
  fileUploadFields,
  schemaFn,
  userData,
  context,
}: {
  fileUploadFields: FileUploadField[];
  schemaFn: string;
  userData: SchemaUserResponse[];
  context: TYPES.List | TYPES.Page;
}): { required: string[]; optional: string[] } => {
  const result: ReturnType<typeof getResponseDataValues> = {
    required: [],
    optional: [],
  };

  if (context === TYPES.List) {
    fileUploadFields.forEach(({ data, required = true }) => {
      userData.forEach((_, index) => {
        const path = `${schemaFn}.${convertNumberToText(index + 1)}.${data.fn}`;
        return required
          ? result.required.push(path)
          : result.optional.push(path);
      });
    });
  }

  if (context === TYPES.Page) {
    fileUploadFields.forEach(({ data, required = true }) => {
      const path = `${schemaFn}.${data.fn}`;
      return required ? result.required.push(path) : result.optional.push(path);
    });
  }

  return result;
};
