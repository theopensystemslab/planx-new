import { useFileUrl } from "@planx/components/shared/hooks";
import React from "react";

export default function ImagePreview({ file, serverFile }: any) {
  const { fileUrl } = useFileUrl({ file, serverFile });

  return <img src={fileUrl} alt="" />;
}
