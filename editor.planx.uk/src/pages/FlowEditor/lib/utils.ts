export const getParentId = (parent: any) => {
  const [, ...ids] = window.location.pathname.split(",");
  let correctParent = parent || null;
  if (!correctParent && ids.length > 0) {
    correctParent = ids.pop();
  }
  return correctParent;
};

// export const safeKeys = (ob: any) =>
//   Object.keys(ob).reduce((acc, curr) => {
//     if (!curr.startsWith("$") && typeof ob[curr] === "string")
//       (acc as any)[curr] = ob[curr];
//     return acc;
//   }, {});
