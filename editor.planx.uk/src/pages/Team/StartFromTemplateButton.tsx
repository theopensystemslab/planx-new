import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";

export interface TemplateOption {
  name: string;
  slug: string;
  id: string;
}

export const StartFromTemplateButton: React.FC<{
  templates: TemplateOption[];
}> = ({ templates }) => {
  const { navigate } = useNavigation();
  const { teamId, teamSlug, createFlowFromTemplate } = useStore();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const formik = useFormik<{ templateId: string }>({
    initialValues: { templateId: templates[0].id },
    onSubmit: async ({ templateId }) => {
      const { slug } = await createFlowFromTemplate(templateId, teamId);
      navigate(`/${teamSlug}/${slug}`);
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Box mt={1}>
      <AddButton onClick={() => setDialogOpen(true)}>
        Start from a template
      </AddButton>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogTitle variant="h3" component="h1">
          {`Start from a template`}
        </DialogTitle>
        <DialogContent>
          {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dictum interdum tellus laoreet faucibus. Aliquam ultricies vitae nunc non efficitur. Mauris leo nulla, luctus sit amet ullamcorper a, porta at mauris. Integer nec elit a magna dapibus bibendum.`}
          <Box mt={2} component="form" onSubmit={formik.handleSubmit}>
            <InputLabel
              label="Available templates"
              id={`select-label-templates`}
            >
              <SelectInput
                value={formik.values.templateId}
                name="templateId"
                bordered
                required={true}
                title={"Available templates"}
                labelId={`select-label-templates`}
                onChange={(e) =>
                  formik.setFieldValue("templateId", e.target.value)
                }
              >
                {templates.map((template) => (
                  <MenuItem key={template.slug} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </SelectInput>
            </InputLabel>
          </Box>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button disableRipple onClick={() => setDialogOpen(false)}>
            BACK
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disableRipple
            onClick={() => formik.handleSubmit()}
          >
            CREATE TEMPLATE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
