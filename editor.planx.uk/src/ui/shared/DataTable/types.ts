import {
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";

export const ColumnType = {
  BOOLEAN: "boolean",
  ARRAY: "array",
} as const;

type ObjectValues<T> = T[keyof T];

export type RenderCellParams = GridRenderCellParams<
  any,
  any,
  any,
  GridTreeNodeWithRender
>;

export type ColumnRenderType = ObjectValues<typeof ColumnType>;

export type ColumnConfig<T> = {
  field: keyof T;
  headerName: string;
  type?: ColumnRenderType;
  width?: number;
  customComponent?:
    | ((params: RenderCellParams) => JSX.Element | undefined)
    | undefined;
  columnOptions?: Omit<GridColDef, "headerName" | "field" | "type">;
};
export interface DataGridProps<T> {
  rows: readonly T[] | undefined;
  columns: Array<ColumnConfig<T>>;
}
