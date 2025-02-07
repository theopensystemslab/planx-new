export const getDeleteFlowConfig = (
  setDeleting: (value: React.SetStateAction<boolean>) => void,
) => {
  return {
    label: "Delete",
    onClick: () => {
      setDeleting(true);
    },
    error: true,
  };
};
