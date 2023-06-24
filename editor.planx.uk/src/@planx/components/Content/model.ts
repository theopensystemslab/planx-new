import { MoreInformation, parseMoreInformation } from "../shared";

export interface Content extends MoreInformation {
  content: string;
  color?: string;
  image?: string;
  alt?: string;
  title?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): Content => ({
  content: data?.content || "",
  color: data?.color,
  image: data?.image,
  alt: data?.alt || "",
  title: data?.title || "",
  ...parseMoreInformation(data),
});
