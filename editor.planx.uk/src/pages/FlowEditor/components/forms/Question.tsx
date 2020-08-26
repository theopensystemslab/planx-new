import {
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import { CallSplit, MoreVert } from "@material-ui/icons";
import arrayMove from "array-move";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormikHookReturn } from "../../../../types";
import { TYPES } from "../../lib/flow";
import { flags } from "../../lib/store";
import {
  Input,
  InputGroup,
  InputRow,
  InputRowItem,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  MoreInformation,
  RichTextInput,
  SelectInput,
} from "./components";
import FileUpload from "./components/FileUpload";

interface Option {
  val?: string;
  description?: string;
  id?: string;
  flag?: string;
  text?: string;
  img?: string;
}

interface IQuestion {
  fn?: string;
  howMeasured?: string;
  description?: string;
  handleClose?: Function;
  handleSubmit?: Function;
  headerTextField?: string;
  notes?: string;
  options?: Option[];
  policyRef?: string;
  text?: string;
  type?: string;
  info?: string;
  Icon;
  $t: number;
  img?: string;
}

const useStyles = makeStyles((theme) => ({
  imageUploadContainer: {
    height: 50,
    width: 50,
    position: "relative",
  },
  menu: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: theme.palette.common.white,
    top: 0,
    right: 0,
  },
}));

const renderMenuItem = (category: string) => {
  return flags
    .filter((flag) => flag.category === category)
    .map((flag, index) => (
      <MenuItem key={index} value={flag.value}>
        {flag.text}
      </MenuItem>
    ));
};

const ImgInput: React.FC<{
  img?: string;
  onChange?: (newUrl?: string) => void;
}> = ({ img, onChange }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

  // Auto-generate a random ID on mount
  const menuId = useMemo(() => {
    return `menu-${Math.floor(Math.random() * 1000000)}`;
  }, []);

  return img ? (
    <div className={classes.imageUploadContainer}>
      <IconButton
        id={`${menuId}-trigger`}
        color="inherit"
        className={classes.menu}
        size="small"
        onClick={(ev) => {
          setAnchorEl(ev.currentTarget);
        }}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id={`${menuId}`}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem component="a" href={img} target="_blank">
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            onChange && onChange(undefined);
          }}
        >
          Remove
        </MenuItem>
      </Menu>
      <img width={50} height={50} src={img} alt="embedded img" />
    </div>
  ) : (
    <Tooltip title="Drop file here">
      <div className={classes.imageUploadContainer}>
        <FileUpload
          onChange={(newUrl) => {
            setAnchorEl(null);
            onChange(newUrl);
          }}
        />
      </div>
    </Tooltip>
  );
};

const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  const addRow = () => {
    formik.setFieldValue("options", [
      ...formik.values.options,
      { text: "", description: "", val: "", flag: "" },
    ]);
  };

  const deleteRow = (index) => {
    formik.setFieldValue(
      "options",
      formik.values.options.filter((option, i) => {
        return i !== index;
      })
    );
  };

  const handleMove = (dragIndex: number, hoverIndex: number): void => {
    formik.setFieldValue(
      "options",
      arrayMove(formik.values.options, dragIndex, hoverIndex)
    );
  };

  return (
    <ModalSectionContent title="Options">
      <React.Fragment>
        {formik.values.options.map((option, index) => {
          return (
            <InputGroup
              deletable
              deleteInputGroup={() => deleteRow(index)}
              draggable
              key={index}
              index={index}
              id={option.id}
              handleMove={handleMove}
            >
              <InputRow>
                <InputRowItem width="50%">
                  {option.id && (
                    <input
                      type="hidden"
                      name={`options[${index}].id`}
                      value={option.id}
                      readOnly
                    />
                  )}

                  <Input
                    // required
                    format="bold"
                    name={`options[${index}].text`}
                    value={option.text || ""}
                    onChange={formik.handleChange}
                    placeholder="Option"
                  />
                </InputRowItem>

                <ImgInput
                  img={option.img}
                  onChange={(img) => {
                    formik.setFieldValue(`options[${index}].img`, img);
                  }}
                />

                <SelectInput
                  name={`options[${index}].flag`}
                  value={option.flag || ""}
                  onChange={formik.handleChange}
                >
                  {option.flag && <MenuItem value="">Remove Flag</MenuItem>}
                  <MenuItem disabled>Listed Buildings</MenuItem>
                  {renderMenuItem("Listed Buildings")}
                  <MenuItem disabled>Planning Permission</MenuItem>
                  {renderMenuItem("Planning Permission")}
                </SelectInput>
              </InputRow>

              <InputRow>
                <Input
                  // required
                  disabled={!formik.values.fn}
                  format="data"
                  name={`options[${index}].val`}
                  value={option.val || ""}
                  placeholder="Data Value"
                  onChange={formik.handleChange}
                />
              </InputRow>
            </InputGroup>
          );
        })}
        <Button onClick={addRow}>add option</Button>
      </React.Fragment>
    </ModalSectionContent>
  );
};

export const GeneralQuestion: React.FC<IQuestion> = ({
  fn = "",
  howMeasured = "",
  description = "",
  headerTextField = "Question",
  text = "",
  notes = "",
  policyRef = "",
  info = "",
  options = [],
  handleSubmit,
  Icon,
  $t,
  img = "",
}) => {
  const formik = useFormik({
    initialValues: {
      info,
      policyRef,
      howMeasured,
      notes,
      text,
      description,
      fn,
      options,
      img,
    },
    onSubmit: ({ options, ...values }) => {
      if (handleSubmit) {
        handleSubmit(
          { $t, ...values },
          options
            .filter((o) => o.text)
            .map((o) => ({ ...o, $t: TYPES.Response }))
        );
      } else {
        alert(JSON.stringify({ $t, ...values, options }, null, 2));
      }
    },
    validate: () => {},
  });

  const focusRef = useRef(null);

  // horrible hack to remove focus from Rich Text Editor
  useEffect(() => {
    setTimeout(() => {
      (document.activeElement as any).blur();
      focusRef.current?.focus();
    }, 50);
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title={headerTextField} Icon={Icon}>
          <InputGroup deletable={false}>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                inputRef={focusRef}
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

            <InputRow>
              <Input
                // required
                format="data"
                name="fn"
                value={formik.values.fn}
                placeholder="Data Field"
                onChange={formik.handleChange}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <MoreInformation
        whyName="info"
        policyName="policyRef"
        definitionName="howMeasured"
        changeField={formik.handleChange}
        policyValue={formik.values.policyRef}
        definitionValue={formik.values.howMeasured}
        whyValue={formik.values.info}
      />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
};

const Question = (props) => (
  <GeneralQuestion
    {...props}
    headerTextField="Question"
    Icon={CallSplit}
    $t={TYPES.Statement}
  />
);

export default Question;
