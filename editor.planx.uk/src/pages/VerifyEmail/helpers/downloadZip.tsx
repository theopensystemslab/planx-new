export const downloadZipFile = (data: Blob) => {
  const href = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", "application.zip");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
