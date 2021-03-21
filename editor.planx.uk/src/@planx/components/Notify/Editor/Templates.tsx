import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import type { FormikProps } from "formik";
import { findAll } from "highlight-words-core";
import React from "react";
import type { AsyncState } from "react-use/lib/useAsync";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import SelectInput from "ui/SelectInput";

export interface Template {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
  version: string;
  created_by: string;
  body: string;
  subject: string;
  letter_contact_block: string;
}

interface Props {
  request: AsyncState<Array<Template>>;
  formik: FormikProps<any>;
}

// https://docs.notifications.service.gov.uk/node.html#send-an-email-arguments-personalisation-required
const PERSONALISATION_REGEX = /\(\(([^)]+)\)\)/g;

const useClasses = makeStyles((theme) => ({
  highlight: {
    background: "#ffd54f",
  },
  field: {
    margin: theme.spacing(1),
    verticalAlign: "middle",
  },
  template: {
    display: "block",
    whiteSpace: "pre-wrap",
  },
}));

export default function Component(props: Props): FCReturn {
  const classes = useClasses();
  const selectedTemplate = props.request.value?.find(
    (x) => x.id === props.formik.values?.templateId
  );

  return (
    <>
      <InputGroup label="API Key">
        <InputRow>
          <FormControl required>
            <TextField
              type="password"
              name="token"
              value={props.formik.values?.token ?? ""}
              placeholder="e542147a-cf33-483b…"
              onChange={props.formik.handleChange}
              error={Boolean(props.request.error)}
              helperText={(() => {
                if (props.request.loading) {
                  return "Loading…";
                }
                if (props.request.error) {
                  return "Invalid API key";
                }
              })()}
            />
          </FormControl>
        </InputRow>
      </InputGroup>
      {Boolean(props.request.value) && (
        <>
          <InputGroup label="Template">
            <InputRow>
              <SelectInput
                value={props.formik.values?.templateId ?? ""}
                name="templateId"
                onChange={(event) => {
                  // Clear pesonalisation fields from previous template
                  // to avoid storing extraneous fields
                  // which would cause the Gov.uk Notify service to fail with "unexpected personalisation fields"
                  Object.keys(
                    props.formik.values?.personalisation ?? {}
                  ).forEach((field) => {
                    props.formik.setFieldValue(
                      `personalisation.${field}`,
                      undefined,
                      false
                    );
                  });
                  props.formik.handleChange(event);
                }}
              >
                {props.request.value?.map(({ id, name }) => (
                  <MenuItem value={id} key={id}>
                    {name}
                  </MenuItem>
                ))}
              </SelectInput>
            </InputRow>
          </InputGroup>
          {selectedTemplate && (
            <>
              <InputGroup label="Data fields">
                <InputRow>
                  <pre className={classes.template}>
                    <b>
                      {findAll({
                        // @ts-ignore: Library type definition is outdated/wrong
                        searchWords: [PERSONALISATION_REGEX],
                        textToHighlight: selectedTemplate?.subject,
                      }).map(({ end, highlight, start }) => {
                        const text = selectedTemplate?.subject.substr(
                          start,
                          end - start
                        );
                        if (highlight) {
                          return HighlightField({ children: text });
                        }
                        return text;
                      })}
                    </b>
                    <br />
                    <br />
                    {findAll({
                      // @ts-ignore: Library type definition is outdated/wrong
                      searchWords: [PERSONALISATION_REGEX],
                      textToHighlight: selectedTemplate?.body,
                    }).map(({ end, highlight, start }) => {
                      const text = selectedTemplate?.body.substr(
                        start,
                        end - start
                      );
                      if (highlight) {
                        return HighlightField({ children: text });
                      }
                      return text;
                    })}
                  </pre>
                </InputRow>
              </InputGroup>
            </>
          )}
        </>
      )}
    </>
  );

  function getPersonalisationFields() {
    return selectedTemplate
      ? [
          ...selectedTemplate.subject.matchAll(PERSONALISATION_REGEX),
          ...selectedTemplate.body.matchAll(PERSONALISATION_REGEX),
        ].map(([match, name]) => name)
      : [];
  }

  function HighlightField({ children }: { children: string }) {
    // Remove parenthesis e.g. `((field))`
    const fieldName = children.slice(2, -2);
    return (
      <TextField
        className={classes.field}
        size="small"
        margin="dense"
        key={`${props.formik.values?.templateId}-${fieldName}`}
        value={props.formik.values?.personalisation?.[fieldName]}
        name={`personalisation.${fieldName}`}
        placeholder={fieldName}
        onChange={props.formik.handleChange}
      />
    );
  }
}
