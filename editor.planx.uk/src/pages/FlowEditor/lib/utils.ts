export const getParentId = (parent: any) => {
  const [, ...ids] = window.location.pathname.split(",");
  let correctParent = parent || null;
  if (!correctParent && ids.length > 0) {
    correctParent = ids.pop();
  }
  return correctParent;
};
