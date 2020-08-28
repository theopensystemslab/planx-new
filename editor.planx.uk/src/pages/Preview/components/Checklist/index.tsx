import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { useFormik } from "formik";
import React from "react";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import InnerCheckbox from "./InnerCheckbox";

interface ICheckboxes {
  text: string;
  checkBoxes: {
    id: string;
    name: string;
    image?: string;
  }[];
  handleSubmit?;
  description?: string;
  info?: string;
}

const Checkboxes: React.FC<ICheckboxes> = ({
  checkBoxes,
  text,
  handleSubmit,
  description = "",
  info,
}) => {
  const formik = useFormik({
    initialValues: {
      checked: [] as any,
    },
    onSubmit: (values) => {
      if (handleSubmit) handleSubmit(values.checked);
    },
    validate: () => {},
  });
  const changeCheckbox = (input) => {
    const { current } = input;
    if (formik.values.checked.includes(current.value)) {
      formik.setFieldValue(
        "checked",
        formik.values.checked.filter((x) => x !== current.value)
      );
    } else {
      formik.setFieldValue("checked", [
        ...formik.values.checked,
        current.value,
      ]);
    }
    return (current.checked = !current.checked);
  };
  const hasImages = (checkBoxes) => checkBoxes.every((val) => val.image);

  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <QuestionHeader description={description} info={info}>
          {text}
        </QuestionHeader>

        {hasImages(checkBoxes) ? (
          <Grid container spacing={2}>
            {checkBoxes.map((cb) => (
              <Grid item xs={6} sm={4} key={cb.name}>
                <InnerCheckbox
                  changeCheckbox={changeCheckbox}
                  image={<img src={cb.image} alt="" />}
                  label={cb.name}
                  value={cb.id}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          checkBoxes.map((cb) => (
            <InnerCheckbox
              changeCheckbox={changeCheckbox}
              key={cb.name}
              label={cb.name}
              value={cb.id}
            />
          ))
        )}
        <Button variant="contained" color="primary" size="large" type="submit">
          Continue
        </Button>
      </form>
    </Card>
  );
};
export default Checkboxes;
