import { MoreInformation, parseMoreInformation } from "../shared";

export interface MapAndLabel extends MoreInformation {
  fn: string;
  title: string;
  description?: string;
  drawColour: string;
  drawType?: "Polygon" | "Point";
}

export const parseContent = (
  data: Record<string, any> | undefined,
): MapAndLabel => ({
  fn: data?.fn || "",
  title: data?.title,
  description: data?.description,
  drawColour: data?.drawColour || "#22194D",
  drawType: data?.drawType || "Polygon",
  ...parseMoreInformation(data),
});
