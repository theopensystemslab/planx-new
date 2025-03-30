import {
  GridColDef,
  GridRenderCellParams,
  GridSingleSelectColDef,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import React from "react";

export const ColumnFilterType = {
  BOOLEAN: "boolean",
  /**
   * Custom data type for columns containing an array of strings
   * Filters are customised to match single select behaviour - values within the array are treated as a discrete list
   */
  ARRAY: "array",
  /**
   * Column contains an discrete set of values
   * Filters default to "is", "is not" vs "contains", "does not contain"
   * Docs: https://mui.com/x/react-data-grid/column-definition/#special-properties
   */
  SINGLE_SELECT: "singleSelect",
  DATE: "date",
  CUSTOM: "custom",
} as const;

type ObjectValues<T> = T[keyof T];

export type RenderCellParams = GridRenderCellParams<
  any,
  any,
  any,
  GridTreeNodeWithRender
>;

export type ColumnRenderType = ObjectValues<typeof ColumnFilterType>;

export type ColumnConfig<T> = {
  field: keyof T;
  headerName: string;
  type?: ColumnRenderType;
  width?: number;
  customComponent?:
    | ((params: RenderCellParams) => JSX.Element | undefined)
    | undefined;
  columnOptions?: Omit<GridColDef, "headerName" | "field" | "type"> &
    Omit<GridSingleSelectColDef, "editable" | "type" | "field">;
};

export interface DataGridProps<T> {
  rows: readonly T[] | undefined;
  columns: Array<ColumnConfig<T>>;
  csvExportFileName?: string;
  onProcessRowUpdate?: (updatedRow: T) => void;
  checkboxSelection?: boolean;
  customTools?: React.FC[];
}
