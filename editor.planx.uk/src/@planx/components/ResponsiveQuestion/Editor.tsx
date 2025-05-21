type Props = EditorProps<TYPES.ResponsiveQuestion, ResponsiveQuestion>;

export default ResponsiveQuestionComponent;

function ResponsiveQuestionComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseResponsiveQuestion(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.ResponsiveQuestion,
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
