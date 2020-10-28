import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import SubIcon from "@material-ui/icons/SubdirectoryArrowRight";
import { useFormik } from "formik";
import React from "react";
import { useNavigation } from "react-navi";
import { rootFlowPath } from "../../../../routes/utils";
import {
  ColorPicker,
  Input,
  InputGroup,
  InputRow,
  ModalSection,
  ModalSectionContent,
  VisibilityToggle,
} from "../../../../ui";
import { TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { IEditor, parseFormValues } from "./shared";

interface IPropertyInformation extends IEditor {
  aboutField?: string;
  dataField?: string;
  descriptionField?: string;
  handleSubmit?: any;
}

const PropertyInformation: React.FC<IPropertyInformation> = ({
  aboutField = "",
  dataField = "",
  definition = "",
  descriptionField = "",
  headerTextField = "",
  notes = "",
  policyField = "",
  whyItMatters = "",
  handleSubmit,
}) => {
  const { navigate } = useNavigation();
  const formik = useFormik({
    initialValues: {
      aboutField,
      dataField,
      definition,
      descriptionField,
      notes,
      policyField,
      whyItMatters,
      fieldsList: [
        {
          name: "",
          values: [
            {
              valueName: "",
              valueDescription: "",
              valueColor: "",
              hasDescriptionAndColor: false,
            },
          ],
        },
      ],
    },
    onSubmit: (values) => {
      const parsed = parseFormValues(Object.entries(values));
      if (handleSubmit) {
        handleSubmit({ type: TYPES.PropertyInformation, data: parsed });

        navigate(rootFlowPath(true));
      } else {
        alert(JSON.stringify(parsed, null, 2));
      }
    },
    validate: () => {},
  });
  const toggleVisibility = (visible, index, subindex) => {
    formik.setFieldValue(
      `fieldsList[${index}].values[${subindex}].hasDescriptionAndColor`,
      visible
    );
  };
  const addField = () => {
    formik.setFieldValue("fieldsList", [
      ...formik.values.fieldsList,
      {
        name: "",
        values: [
          {
            valueName: "",
            valueDescription: "",
            valueColor: "",
            hasDescriptionAndColor: false,
          },
        ],
      },
    ]);
  };
  const deleteField = (index) => {
    formik.setFieldValue(
      "fieldsList",
      formik.values.fieldsList.filter((field, i) => {
        return i !== index;
      })
    );
  };
  const addValue = (index) => {
    formik.setFieldValue(`fieldsList[${index}].values`, [
      ...formik.values.fieldsList[index].values,
      {
        valueName: "",
        valueDescription: "",
        valueColor: "",
        hasDescriptionAndColor: false,
      },
    ]);
  };
  const deleteValue = (index, subindex) => {
    formik.setFieldValue(
      `fieldsList[${index}].values`,
      formik.values.fieldsList[index].values.filter((field, i) => {
        return i !== subindex;
      })
    );
  };
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title={headerTextField}
          Icon={ICONS[TYPES.PropertyInformation]}
        >
          <InputRow>
            <Input
              // grow
              autoFocus
              name="aboutField"
              value={formik.values.aboutField}
              format="large"
              placeholder="About the property"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              name="descriptionField"
              // grow
              value={formik.values.descriptionField}
              placeholder="This is the information we have about the property"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              name="dataField"
              format="data"
              // grow
              value={formik.values.dataField}
              placeholder="data field containing boundary data"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="Featured constraints">
          <React.Fragment>
            {formik.values.fieldsList.map((field, index) => {
              return (
                <InputGroup
                  draggable
                  deletable
                  key={index}
                  deleteInputGroup={() => deleteField(index)}
                >
                  <React.Fragment>
                    <InputRow>
                      <Input
                        // required
                        name={`fieldsList[${index}].name`}
                        onChange={formik.handleChange}
                        placeholder="data field"
                        value={field.name}
                      />
                    </InputRow>
                    {field.values.map((item, subindex) => {
                      return (
                        <InputGroup
                          deletable
                          key={subindex}
                          deleteInputGroup={() => deleteValue(index, subindex)}
                        >
                          <InputRow RowIcon={SubIcon}>
                            <Input
                              // required
                              name={`fieldsList[${index}].values[${subindex}].valueName`}
                              onChange={formik.handleChange}
                              format="data"
                              placeholder="data value"
                              endAdornment={
                                <InputAdornment position="end">
                                  <VisibilityToggle
                                    visible={item.hasDescriptionAndColor}
                                    onChange={(visible) =>
                                      toggleVisibility(visible, index, subindex)
                                    }
                                  />
                                </InputAdornment>
                              }
                            />
                            {item.hasDescriptionAndColor ? (
                              <React.Fragment>
                                <Input
                                  // required
                                  name={`fieldsList[${index}].values[${subindex}].valueDescription`}
                                  onChange={formik.handleChange}
                                  placeholder="description text"
                                />
                                <ColorPicker
                                  inline
                                  color={item.valueColor}
                                  onChange={(color) =>
                                    formik.setFieldValue(
                                      `fieldsList[${index}].values[${subindex}].valueColor`,
                                      color
                                    )
                                  }
                                />
                              </React.Fragment>
                            ) : null}
                          </InputRow>
                        </InputGroup>
                      );
                    })}
                  </React.Fragment>
                  <InputRow childRow>
                    <div>
                      <Button variant="text" onClick={() => addValue(index)}>
                        add a value
                      </Button>
                    </div>
                  </InputRow>
                </InputGroup>
              );
            })}
          </React.Fragment>
          <Button variant="text" onClick={addField}>
            add field
          </Button>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default PropertyInformation;
