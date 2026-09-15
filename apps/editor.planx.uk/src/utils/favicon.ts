export const setFavicon = (href: string): void => {
  const existing = document.getElementById("favicon") as HTMLLinkElement | null;

  const link = document.createElement("link");
  link.id = "favicon";
  link.rel = "icon";
  link.href = href;

  existing?.remove();
  document.head.appendChild(link);
};
