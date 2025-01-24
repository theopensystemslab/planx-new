import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { DataFieldAutocomplete } from "@planx/components/shared/DataFieldAutocomplete";
import { FormikErrors, FormikValues, useFormik } from "formik";
import { TabList } from "pages/FlowEditor/components/Sidebar";
import StyledTab from "pages/FlowEditor/components/Sidebar/StyledTab";
import React, { useEffect, useRef,useState } from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { Option, parseBaseNodeData } from "../../shared";
import { ICONS } from "../../shared/icons";
import type { Checklist } from "../model";
import { toggleExpandableChecklist } from "../model";
import { ChecklistProps } from "../types";
import { Options } from "./Options";

export const ChecklistEditor: React.FC<ChecklistProps> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<Checklist>({
    initialValues: {
      allRequired: props.node?.data?.allRequired || false,
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      img: props.node?.data?.img || "",
      options: props.options,
      text: props.node?.data?.text || "",
      ...parseBaseNodeData(props.node?.data),
    },
    onSubmit: ({ options, groupedOptions, ...values }) => {
      const sourceOptions = options?.length
        ? options
        : groupedOptions?.flatMap((group) => group.children);

      const filteredOptions = (sourceOptions || []).filter(
        (option) => option.data.text,
      );

      const processedOptions = filteredOptions.map((option) => ({
        ...option,
        id: option.id || undefined,
        type: TYPES.Answer,
      }));

      if (props.handleSubmit) {
        props.handleSubmit(
          {
            type,
            data: {
              ...values,
              ...(groupedOptions
                ? {
                  categories: groupedOptions.map((group) => ({
                    title: group.title,
                    count: group.children.length,
                  })),
                }
                : {
                  categories: undefined,
                }),
            },
          },
          processedOptions,
        );
      } else {
        alert(JSON.stringify({ type, ...values, options }, null, 2));
      }
    },
    validate: ({ options, groupedOptions, allRequired, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};

      // Account for flat or expandable Checklist options
      options = options || groupedOptions?.flatMap((group) => group.children);

      const exclusiveOptions: Option[] | undefined = options?.filter(
        (option) => option.data.exclusive,
      );
      if (allRequired && exclusiveOptions && exclusiveOptions.length > 0) {
        errors.allRequired =
          'Cannot configure exclusive "or" option alongside "all required" setting';
      }
      if (values.fn && !options?.some((option) => option.data.val)) {
        errors.fn =
          "At least one option must also set a data field";
      }
      if (exclusiveOptions && exclusiveOptions.length > 1) {
        errors.options =
          "There should be a maximum of one exclusive option configured";
      }
      return errors;
    },
  });

  const focusRef = useRef<HTMLInputElement | null>(null);

  // horrible hack to remove focus from Rich Text Editor
  useEffect(() => {
    setTimeout(() => {
      (document.activeElement as any).blur();
      focusRef.current?.focus();
    }, 50);
  }, []);

  const [activeTab, setActiveTab] = useState(0);

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
          <ModalSectionContent title="Checklist" Icon={ICONS[type]}>
            <InputGroup>
              <InputRow>
                <Input
                  format="large"
                  name="text"
                  value={formik.values.text}
                  placeholder="Text"
                  onChange={formik.handleChange}
                  inputRef={focusRef}
                  required
                />
                <ImgInput
                  img={formik.values.img}
                  onChange={(newUrl) => {
                    formik.setFieldValue("img", newUrl);
                  }}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  name="description"
                  value={formik.values.description}
                  placeholder="Description"
                  onChange={formik.handleChange}
                />
              </InputRow>
              <DataFieldAutocomplete
                value={formik.values.fn}
                onChange={(value) => formik.setFieldValue("fn", value)}
              />
              <InputRow>
                <Switch
                  checked={!!formik.values.groupedOptions}
                  onChange={() =>
                    formik.setValues({
                      ...formik.values,
                      ...toggleExpandableChecklist({
                        options: formik.values.options,
                        groupedOptions: formik.values.groupedOptions,
                      }),
                    })
                  }
                  label="Expandable"
                />
              </InputRow>
              <InputRow>
                <Switch
                  checked={formik.values.allRequired}
                  onChange={() =>
                    formik.setFieldValue(
                      "allRequired",
                      !formik.values.allRequired,
                    )
                  }
                  label="All required"
                />
              </InputRow>

              <InputRow>
                <Switch
                  checked={formik.values.neverAutoAnswer}
                  onChange={() =>
                    formik.setFieldValue(
                      "neverAutoAnswer",
                      !formik.values.neverAutoAnswer,
                    )
                  }
                  label="Always put to user (forgo automation)"
                />
              </InputRow>
            </InputGroup>
          </ModalSectionContent>
          <ErrorWrapper error={formik.errors.options}>
            <Options formik={formik} />
          </ErrorWrapper>
        </ModalSection>
        <ModalFooter formik={formik} />
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
        <Box mt={1}>
          <iframe
            width="680"
            height="680"
            src="https://scribehow.com/shared/Creating_a_Checklist_in_PlanX_Editor__E-wF1ViORmm-ieO-V0mpMA"
            title="Using the checklist component"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            style={{ border: "1px solid #DBDADA" }}
          ></iframe>
        </Box>
      </Box>
    </form>
  );
};

export default ChecklistEditor;
