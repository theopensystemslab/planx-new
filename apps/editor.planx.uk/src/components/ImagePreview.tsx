import { useFileUrl, UseFileUrlProps } from "@planx/components/shared/hooks";
import React from "react";

export default function ImagePreview(props: UseFileUrlProps) {
  const { fileUrl } = useFileUrl(props);

  return <img src={fileUrl} alt={`Preview of uploaded file: ${fileUrl}`} />;
}
