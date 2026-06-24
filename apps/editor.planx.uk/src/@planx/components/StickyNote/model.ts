import { object, SchemaOf, string } from "yup";

export type NotePlacement = "attached" | "standalone";

export interface StickyNote {
  text: string;
  color?: string;
  placement: NotePlacement;
}

export const DEFAULT_NOTE_COLOR = "#fffdb0";

export const parseStickyNote = (
  data: Record<string, any> | undefined,
  defaultPlacement: NotePlacement = "standalone",
): StickyNote => ({
  text: data?.text || "",
  color: data?.color || DEFAULT_NOTE_COLOR,
  placement: data?.placement || defaultPlacement,
});

export const validationSchema: SchemaOf<StickyNote> = object({
  text: string().required(),
  color: string(),
  placement: string().oneOf(["attached", "standalone"]).required() as any,
});
