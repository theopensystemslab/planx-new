import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { richText } from "lib/yupExtensions";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import { useGetGlobalSettings, useUpdateGlobalSettings } from "./queries";
import type { TextContent } from "types";
import { AddButton } from "ui/editor/AddButton";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SettingsDescription from "ui/editor/SettingsDescription";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { slugify } from "utils";
import { boolean, object, string } from "yup";

const itemSchema = object({
  heading: string().required("Page title is required"),
  content: richText().required("Page content is required"),
  show: boolean().required(),
});

const buildFooterContent = (
  items: TextContent[],
): Record<string, TextContent> => {
  const result: Record<string, TextContent> = {};
  for (const item of items) {
    result[slugify(item.heading)] = item;
  }
  return result;
};

interface FooterItemProps {
  item: TextContent;
  onSave: (updated: TextContent) => void;
  onDelete: () => void;
}

const FooterItem: React.FC<FooterItemProps> = ({ item, onSave, onDelete }) => (
  <NewSettingsSection>
    <Formik<TextContent>
      initialValues={item}
      enableReinitialize
      validationSchema={itemSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={(values) => onSave(values)}
    >
      {({ values, errors, setFieldValue, dirty, resetForm }) => (
        <Form>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <InputLegend>Footer element</InputLegend>
              <SettingsDescription>
                The heading appears as a footer link that opens a content page.
              </SettingsDescription>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  paddingTop: 0.25,
                }}
              >
                <InputRow>
                  <InputRowItem>
                    <Input
                      placeholder="Page title"
                      format="bold"
                      value={values.heading}
                      onChange={(ev) =>
                        setFieldValue("heading", ev.target.value)
                      }
                      errorMessage={errors.heading}
                    />
                  </InputRowItem>
                </InputRow>
                <InputRow>
                  <InputRowItem>
                    <RichTextInput
                      placeholder="Page content"
                      multiline
                      rows={6}
                      value={values.content}
                      onChange={(ev) =>
                        setFieldValue("content", ev.target.value)
                      }
                      errorMessage={errors.content}
                    />
                  </InputRowItem>
                </InputRow>
              </Box>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Box display="flex" gap={1.5}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!dirty}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => resetForm()}
                    type="reset"
                    variant="contained"
                    color="secondary"
                    disabled={!dirty}
                  >
                    Reset changes
                  </Button>
                </Box>
                <Button onClick={onDelete} color="error">
                  Delete
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  </NewSettingsSection>
);

function FooterSettings() {
  const { data } = useGetGlobalSettings();
  const toast = useToast();
  const [updateGlobalSettings] = useUpdateGlobalSettings();

  const initialItems: TextContent[] = data?.globalSettings[0]?.footerContent
    ? Object.values(data.globalSettings[0].footerContent)
    : [];

  const [items, setItems] = useState<TextContent[]>(initialItems);
  const keysRef = useRef<string[]>(initialItems.map(() => nanoid()));

  const handleSave = async (index: number, updated: TextContent) => {
    const newItems = items.map((item, i) => (i === index ? updated : item));
    setItems(newItems);
    try {
      await updateGlobalSettings({
        variables: { footerContent: buildFooterContent(newItems) },
      });
      toast.success("Footer element saved successfully");
    } catch {
      toast.error("Failed to save footer element");
    }
  };

  const handleDelete = async (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    keysRef.current = keysRef.current.filter((_, i) => i !== index);
    setItems(newItems);
    try {
      await updateGlobalSettings({
        variables: { footerContent: buildFooterContent(newItems) },
      });
      toast.success("Footer element deleted");
    } catch {
      toast.error("Failed to delete footer element");
    }
  };

  const handleAdd = () => {
    setItems((prev) => [...prev, { heading: "", content: "", show: true }]);
    keysRef.current = [...keysRef.current, nanoid()];
  };

  return (
    <>
      {items.map((item, index) => (
        <FooterItem
          key={keysRef.current[index]}
          item={item}
          onSave={(updated) => handleSave(index, updated)}
          onDelete={() => handleDelete(index)}
        />
      ))}
      <NewSettingsSection>
        <AddButton onClick={handleAdd}>Add footer element</AddButton>
      </NewSettingsSection>
    </>
  );
}

export default FooterSettings;
