import { DEFAULT_NOTE_COLOR, NotePlacement } from "hooks/data/useFlowNodeNotes";
import { object, SchemaOf, string } from "yup";

export type { NotePlacement };

export interface StickyNote {
  text: string;
  color?: string;
  placement: NotePlacement;
}

export const parseStickyNote = (
  data: Record<string, any> | undefined,
  defaultPlacement: NotePlacement = "before_node",
): StickyNote => ({
  text: data?.text || "",
  color: data?.color || DEFAULT_NOTE_COLOR,
  placement: data?.placement || defaultPlacement,
});

export const validationSchema: SchemaOf<StickyNote> = object({
  text: string().required(),
  color: string(),
  placement: string()
    .oneOf([
      "attached_to_node",
      "attached_to_option",
      "after_node",
      "before_node",
    ])
    .required() as any,
});
