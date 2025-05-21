type Props = EditorProps<TYPES.ResponsiveChecklist, ResponsiveChecklist>;

export default ResponsiveChecklistComponent;

function ResponsiveChecklistComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseResponsiveChecklist(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.ResponsiveChecklist,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      //...
    </form>
  );
}
