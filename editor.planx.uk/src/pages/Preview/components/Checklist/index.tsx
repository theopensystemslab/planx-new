import Button from "@material-ui/core/Button";
import { useFormik } from "formik";
import React from "react";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import InnerCheckbox from "./InnerCheckbox";

interface ICheckboxes {
  text: string;
  checkBoxes: {
    id: string;
    text: string;
    img?: string;
  }[];
  allRequired?: boolean;
  handleSubmit?;
  description?: string;
  info?: string;
}

const Checkboxes: React.FC<ICheckboxes> = ({
  checkBoxes,
  text,
  handleSubmit,
  description = "",
  allRequired,
  info,
}) => {
  const formik = useFormik({
    initialValues: {
      checked: [],
    },
    onSubmit: (values) => {
      if (handleSubmit) handleSubmit(values.checked);
    },
    validate: () => {},
  });

  const allChecked = formik.values.checked.length === checkBoxes.length;

  const changeCheckbox = (input) => {
    const { current } = input;

    let newCheckedIds;

    if (formik.values.checked.includes(current.value)) {
      newCheckedIds = formik.values.checked.filter((x) => x !== current.value);
    } else {
      newCheckedIds = [...formik.values.checked, current.value];
    }

    formik.setFieldValue(
      "checked",
      newCheckedIds.sort((a, b) => {
        const originalIds = checkBoxes.map((cb) => cb.id);
        return originalIds.indexOf(b) - originalIds.indexOf(a);
      })
    );

    return (current.checked = !current.checked);
  };

  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <QuestionHeader description={description} info={info}>
          {text}
        </QuestionHeader>

        {checkBoxes.map((cb) => (
          <InnerCheckbox
            changeCheckbox={changeCheckbox}
            key={cb.text}
            label={cb.text}
            value={cb.id}
          />
        ))}
        <Button
          disabled={allRequired && !allChecked}
          variant="contained"
          color="primary"
          size="large"
          type="submit"
        >
          Continue
        </Button>
      </form>
    </Card>
  );
};
export default Checkboxes;
