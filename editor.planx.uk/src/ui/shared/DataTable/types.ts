import {
  GridColDef,
  GridRenderCellParams,
  GridSingleSelectColDef,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";

export const ColumnFilterType = {
  BOOLEAN: "boolean",
  ARRAY: "singleSelect", // when the column can be filtered from a range of known values
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
}
