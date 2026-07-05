import type { UseFileUrlProps } from "@planx/components/shared/hooks";
import { useFileUrl } from "@planx/components/shared/hooks";
import React from "react";

export default function ImagePreview(props: UseFileUrlProps) {
  const { fileUrl } = useFileUrl(props);

  if (!fileUrl) return null;

  return <img src={fileUrl} alt={`Preview of uploaded file: ${fileUrl}`} />;
}
