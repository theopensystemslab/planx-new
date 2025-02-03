import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import { TabList } from "pages/FlowEditor/components/Sidebar";
import StyledTab from "pages/FlowEditor/components/Sidebar/StyledTab";
import React, { useState } from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { parseSetValue, SetValue } from "./model";

type Props = EditorProps<TYPES.SetValue, SetValue>;

interface Option {
  value: SetValue["operation"];
  label: string;
}

const options: Option[] = [
  {
    value: "replace",
    label: "Replace",
  },
  {
    value: "append",
    label: "Append",
  },
  {
    value: "removeOne",
    label: "Remove single value",
  },
  {
    value: "removeAll",
    label: "Remove all values",
  },
];

const DescriptionText: React.FC<SetValue> = ({ fn, val, operation }) => {
  if (!fn || !val) return null;

  switch (operation) {
    case "replace":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> will be replaced by{" "}
          <strong>{val}</strong>
        </Typography>
      );
    case "append":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> will have{" "}
          <strong>{val}</strong> appended to it
        </Typography>
      );
    case "removeOne":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> set to{" "}
          <strong>{val}</strong> will be removed
        </Typography>
      );
    case "removeAll":
      return (
        <Typography mb={2}>
          All existing values for <strong>{fn}</strong> will be removed
        </Typography>
      );
  }
};

const SetValueComponent: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState(0);

  const formik = useFormik({
    initialValues: parseSetValue(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetValue,
        data: newValues,
      });
    },
  });

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("operation", target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TabList sx={{ marginLeft: "-24px", width: "calc(100% + 48px)" }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <StyledTab label="Component settings" />
          <StyledTab label="How to use this component" />
        </Tabs>
      </TabList>
      <Box
        style={{
          display: activeTab === 0 ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
        }}
      >
        <ModalSection>
          <ModalSectionContent title="Passport field name">
            <DataFieldAutocomplete
              required
              value={formik.values.fn}
              onChange={(value) => formik.setFieldValue("fn", value)}
            />
          </ModalSectionContent>
          {formik.values.operation !== "removeAll" && (
            <ModalSectionContent title="Field value">
              <InputRow>
                <Input
                  required
                  format="data"
                  name="val"
                  value={formik.values.val}
                  placeholder="value"
                  onChange={formik.handleChange}
                />
              </InputRow>
            </ModalSectionContent>
          )}
          <ModalSectionContent title="Operation">
            <DescriptionText {...formik.values} />
            <FormControl component="fieldset">
              <RadioGroup
                defaultValue="replace"
                value={formik.values.operation}
              >
                {options.map((option) => (
                  <BasicRadio
                    key={option.value}
                    id={option.value}
                    title={option.label}
                    variant="compact"
                    value={option.value}
                    onChange={handleRadioChange}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </ModalSectionContent>
        </ModalSection>
        <ModalFooter formik={formik} showMoreInformation={false} />
      </Box>
      <Box
        sx={{
          display: activeTab === 1 ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          padding: "16px",
          overflow: "auto",
        }}
      >
        <Typography variant="body1" mt={2}>
          The Set Value component allows you to modify the values of a specific
          field in the Passport. You can choose an operation (e.g., replace,
          append, remove) and specify the field name and value. Ensure you have
          configured the appropriate field names and operations before saving
          changes.
        </Typography>
        <Box mt={4}>
          <iframe
            width="680"
            height="383"
            src="https://www.youtube.com/embed/r3nXC0jgVIg"
            title="10 Using the set component"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </Box>
      </Box>
    </form>
  );
};

export default SetValueComponent;
