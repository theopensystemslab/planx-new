import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { PASSPORT_REQUESTED_FILES_KEY } from "@planx/components/FileUploadAndLabel/model";
import { convertNumberToText } from "@planx/components/List/utils";
import { mergeWith, partition, unzip } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";

import {
  Field,
  FileUploadField,
  ResponseValue,
  Schema,
  SchemaUserResponse,
} from "./model";

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
    (field): field is FileUploadField => field.type === "fileUpload"
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

  const uniqueRequired = [
    ...new Set([...required, ...responseDataValues.required]),
  ];
  const uniqueOptional = [
    ...new Set([...optional, ...responseDataValues.optional]),
  ];

  // Return updated requested files state
  return {
    [PASSPORT_REQUESTED_FILES_KEY]: {
      required: uniqueRequired,
      optional: uniqueOptional,
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
        const path = getPath({ context, dataFn: data.fn, schemaFn, index });
        return required
          ? result.required.push(path)
          : result.optional.push(path);
      });
    });
  }

  if (context === TYPES.Page) {
    fileUploadFields.forEach(({ data, required = true }) => {
      const path = getPath({ context, dataFn: data.fn, schemaFn });
      return required ? result.required.push(path) : result.optional.push(path);
    });
  }

  return result;
};

interface PagePathArgs {
  context: TYPES.Page;
  dataFn: string;
  schemaFn: string;
}

interface ListPathArgs {
  context: TYPES.List;
  index: number;
  dataFn: string;
  schemaFn: string;
}

export const getPath = (args: ListPathArgs | PagePathArgs) => {
  const { context, dataFn, schemaFn } = args;

  // Responses using a valid schema "FileType" should be extracted as a root-level passport field
  const fileTypeValues = getValidSchemaValues("FileType") || [];
  const isSchemaFileType = fileTypeValues.includes(dataFn);
  if (isSchemaFileType) return dataFn;

  switch (context) {
    case TYPES.List:
      return `${schemaFn}.${convertNumberToText(args.index + 1)}.${dataFn}`;
    case TYPES.Page:
      return `${schemaFn}.${dataFn}`;
  }
};

/**
 * Partition responses by FileUploadField
 * Required as these responses are stored at the root of the passport, not deeply nested within a flattened data structure
 */
export const partitionSchemaData = (
  data: SchemaUserResponse[],
  schema: Schema
 ) => {
  const fileUploadFns = schema.fields
    .filter(({ type }) => type === "fileUpload")
    .map(({ data }) => data.fn);

  const partitionFileUploadFields = (obj: SchemaUserResponse) => {
    const entries = Object.entries(obj);

    const [matchingEntries, restEntries] = partition(entries, ([key]) =>
      fileUploadFns.includes(key)
    );

    const matchingProperties = Object.fromEntries(matchingEntries);
    const restProperties = Object.fromEntries(restEntries);

    return [matchingProperties, restProperties];
  };

  const partitioned = data.map((partitionFileUploadFields));

  // Regroup responses - one array of FileUploadFields, one array of the remaining responses
  const result = unzip(partitioned)

  return result;
};

/**
 * Group all FileUploadField respones by key, to be stored at passport root
 */
export const flattenFileUpload = (data: Record<string, ResponseValue<Field>>[]) =>
  mergeWith(
    {},
    ...data,
    (objValue: ResponseValue<Field>[] | undefined, srcValue: ResponseValue<Field>[]) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }
  );