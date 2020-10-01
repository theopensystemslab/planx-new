import { Typography } from "@material-ui/core";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import { useFormik } from "formik";
import React from "react";
import { useNavigation } from "react-navi";
import { rootFlowPath } from "../../../../routes/utils";
import { TYPES } from "../../data/types";
import {
  Input,
  InputGroup,
  InputRow,
  ModalSectionContent,
  OptionButton,
} from "../../../../ui";
import { IEditor, parseFormValues } from "./shared";

interface IFindProperty extends IEditor {
  addressLineOne?: boolean;
  addressLineOneValue?: string;
  addressLineThree?: boolean;
  addressLineThreeValue?: string;
  addressLineTwo?: boolean;
  addressLineTwoValue?: string;
  buildingTypes?: boolean;
  buildingTypesValue?: string;
  district?: boolean;
  districtValue?: string;
  easting?: boolean;
  eastingValue?: string;
  northing?: boolean;
  northingValue?: string;
  postcode?: boolean;
  postcodeValue?: string;
  propertyArea?: boolean;
  propertyAreaValue?: string;
  uprn?: boolean;
  uprnValue?: string;
  handleSubmit?;
}

const FindProperty: React.FC<IFindProperty> = ({
  addressLineOne = false,
  addressLineOneValue = "",
  addressLineThree = false,
  addressLineThreeValue = "",
  addressLineTwo = false,
  addressLineTwoValue = "",
  buildingTypes = false,
  buildingTypesValue = "",
  district = false,
  districtValue = "",
  easting = false,
  eastingValue = "",
  headerTextField = "",
  northing = false,
  northingValue = "",
  notes = "",
  postcode = false,
  postcodeValue = "",
  propertyArea = false,
  propertyAreaValue = "",
  uprn = true,
  uprnValue = "",
  handleSubmit,
}) => {
  const { navigate } = useNavigation();
  const formik = useFormik({
    initialValues: {
      addressLineOne,
      addressLineOneValue,
      addressLineThree,
      addressLineThreeValue,
      addressLineTwo,
      addressLineTwoValue,
      buildingTypes,
      buildingTypesValue,
      district,
      districtValue,
      easting,
      eastingValue,
      northing,
      northingValue,
      notes,
      postcode,
      postcodeValue,
      propertyArea,
      propertyAreaValue,
      uprn,
      uprnValue,
      handleSubmit,
    },
    onSubmit: (values) => {
      const parsed = parseFormValues(Object.entries(values), {
        $t: TYPES.FindProperty,
      });

      if (handleSubmit) {
        handleSubmit(parsed);
        navigate(rootFlowPath(true));
      } else {
        alert(JSON.stringify(parsed, null, 2));
      }
    },
    validate: () => {},
  });
  return (
    <ModalSectionContent title={headerTextField} Icon={SearchOutlinedIcon}>
      <form onSubmit={formik.handleSubmit} id="modal">
        <Typography variant="subtitle2" gutterBottom>
          Data to be collected about the property
        </Typography>
        <InputGroup>
          <>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.uprn}
                onClick={() => {
                  if (formik.values.uprn === true) {
                    formik.setFieldValue("uprnValue", "");
                  }
                  formik.setFieldValue("uprn", !formik.values.uprn);
                }}
              >
                UPRN
              </OptionButton>
              {formik.values.uprn ? (
                <Input
                  onChange={formik.handleChange}
                  name="uprnValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>{" "}
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.addressLineOne}
                onClick={() => {
                  if (formik.values.addressLineOne === true) {
                    formik.setFieldValue("addressLineOneValue", "");
                  }
                  formik.setFieldValue(
                    "addressLineOne",
                    !formik.values.addressLineOne
                  );
                }}
              >
                Address Line 1
              </OptionButton>
              {formik.values.addressLineOne ? (
                <Input
                  onChange={formik.handleChange}
                  name="addressLineOneValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.addressLineTwo}
                onClick={() => {
                  if (formik.values.addressLineTwo === true) {
                    formik.setFieldValue("addressLineTwoValue", "");
                  }
                  formik.setFieldValue(
                    "addressLineTwo",
                    !formik.values.addressLineTwo
                  );
                }}
              >
                Address Line 2
              </OptionButton>
              {formik.values.addressLineTwo ? (
                <Input
                  onChange={formik.handleChange}
                  name="addressLineTwoValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.addressLineThree}
                onClick={() => {
                  if (formik.values.addressLineThree === true) {
                    formik.setFieldValue("addressLineThreeValue", "");
                  }
                  formik.setFieldValue(
                    "addressLineThree",
                    !formik.values.addressLineThree
                  );
                }}
              >
                Address Line 3
              </OptionButton>
              {formik.values.addressLineThree ? (
                <Input
                  onChange={formik.handleChange}
                  name="addressLineThreeValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.postcode}
                onClick={() => {
                  if (formik.values.postcode === true) {
                    formik.setFieldValue("postcodeValue", "");
                  }
                  formik.setFieldValue("postcode", !formik.values.postcode);
                }}
              >
                Postcode
              </OptionButton>
              {formik.values.postcode ? (
                <Input
                  onChange={formik.handleChange}
                  name="postcodeValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.district}
                onClick={() => {
                  if (formik.values.district === true) {
                    formik.setFieldValue("districtValue", "");
                  }
                  formik.setFieldValue("district", !formik.values.district);
                }}
              >
                District
              </OptionButton>
              {formik.values.district ? (
                <Input
                  onChange={formik.handleChange}
                  name="districtValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.buildingTypes}
                onClick={() => {
                  if (formik.values.buildingTypes === true) {
                    formik.setFieldValue("buildingTypesValue", "");
                  }
                  formik.setFieldValue(
                    "buildingTypes",
                    !formik.values.buildingTypes
                  );
                }}
              >
                Building Type(s)
              </OptionButton>
              {formik.values.buildingTypes ? (
                <Input
                  onChange={formik.handleChange}
                  name="buildingTypesValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.propertyArea}
                onClick={() => {
                  if (formik.values.propertyArea === true) {
                    formik.setFieldValue("propertyAreaValue", "");
                  }
                  formik.setFieldValue(
                    "propertyArea",
                    !formik.values.propertyArea
                  );
                }}
              >
                Property Area
              </OptionButton>
              {formik.values.propertyArea ? (
                <Input
                  onChange={formik.handleChange}
                  name="propertyAreaValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.easting}
                onClick={() => {
                  if (formik.values.easting === true) {
                    formik.setFieldValue("eastingValue", "");
                  }
                  formik.setFieldValue("easting", !formik.values.easting);
                }}
              >
                Easting
              </OptionButton>
              {formik.values.easting ? (
                <Input
                  onChange={formik.handleChange}
                  name="eastingValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
            <InputRow>
              <OptionButton
                color=""
                selected={formik.values.northing}
                onClick={() => {
                  if (formik.values.northing === true) {
                    formik.setFieldValue("northingValue", "");
                  }
                  formik.setFieldValue("northing", !formik.values.northing);
                }}
              >
                Northing
              </OptionButton>
              {formik.values.northing ? (
                <Input
                  onChange={formik.handleChange}
                  name="northingValue"
                  placeholder="Passport field"
                />
              ) : null}
            </InputRow>
          </>
        </InputGroup>
      </form>
    </ModalSectionContent>
    // <InternalNotes
    //   name="notes"
    //   onChange={formik.handleChange}
    //   value={formik.values.notes}
    // />
  );
};

export default FindProperty;
