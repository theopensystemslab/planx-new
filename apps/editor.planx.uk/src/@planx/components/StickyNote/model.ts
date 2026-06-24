import { object, SchemaOf, string } from "yup";

export interface StickyNote {
  text: string;
  color?: string;
}

export const DEFAULT_NOTE_COLOR = "#fffdb0";

export const parseStickyNote = (
  data: Record<string, any> | undefined,
): StickyNote => ({
  text: data?.text || "",
  color: data?.color || DEFAULT_NOTE_COLOR,
});

export const validationSchema: SchemaOf<StickyNote> = object({
  text: string().required(),
  color: string(),
});
