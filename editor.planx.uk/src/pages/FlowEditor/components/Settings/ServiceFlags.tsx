import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/ColorPicker";
import Input from "ui/Input";
import InputGroup from "ui/InputGroup";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";

const Swatch = styled(Box)(({ theme }) => ({
  width: 18,
  height: 18,
  display: "inline-block",
  marginRight: theme.spacing(1),
  verticalAlign: "middle",
  marginTop: -3,
}));

export interface IServiceFlags {
  flagSets: {
    id?: number;
    name: string;
    dataField: string;
    flags: {
      title: string;
      dataValue: string;
      color: string;
      new?: true;
    }[];
  }[];
}

const ServiceFlags: React.FC<IServiceFlags> = ({ flagSets }) => {
  const formik = useFormik({
    initialValues: {
      flagSets,
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  const deleteFlagSet = (index: number) => {
    formik.setFieldValue(
      "flagSets",
      formik.values.flagSets.filter((flag, i) => {
        return i !== index;
      }),
    );
  };
  const addFlagToFlagSet = (flagIndex: number) => {
    formik.setFieldValue(`flagSets[${flagIndex}].flags`, [
      ...formik.values.flagSets[flagIndex].flags,
      {
        title: "",
        dataValue: "",
        color: "",
        new: true,
      },
    ]);
  };
  const addFlagSet = () => {
    formik.setFieldValue("flagSets", [
      ...formik.values.flagSets,
      {
        name: "",
        dataField: "",
        flags: [
          {
            title: "",
            dataValue: "",
            color: "",
          },
        ],
      },
    ]);
  };
  const deleteFlagFromFlagSet = (flagSetIndex: number, flagIndex: number) => {
    formik.setFieldValue(
      `flagSets[${flagSetIndex}].flags`,
      formik.values.flagSets[flagSetIndex].flags.filter((flagSet, i) => {
        return i !== flagIndex;
      }),
    );
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h2" component="h3" gutterBottom>
          <strong>Service flags</strong>
        </Typography>
        <Typography variant="body1">
          Manage the flag sets that this service uses. Flags at the top of a set
          override flags below.
        </Typography>
      </Box>
      <Box>
        {formik.values.flagSets.map((flagSet, i) => {
          return (
            <Box py={3} width="100%" borderBottom={1} key={i}>
              <Box pb={3}>
                <InputGroup
                  deletable={flagSet.id ? false : true}
                  deleteInputGroup={() => deleteFlagSet(i)}
                  key={i}
                >
                  <InputRow>
                    <Input
                      format="large"
                      name={`flagSets[${i}].name`}
                      value={flagSet.name}
                      onChange={formik.handleChange}
                      placeholder="Flag set"
                    />
                  </InputRow>
                  <InputRow>
                    <Input
                      format="data"
                      name={`flagSets[${i}].dataField`}
                      value={flagSet.name}
                      onChange={formik.handleChange}
                      placeholder="data field"
                    />
                  </InputRow>
                </InputGroup>
              </Box>
              {flagSet.flags.map((flag, j) => {
                return (
                  <Box pl={6.5} pb={2} key={j}>
                    <InputGroup
                      deletable={flag.new ? true : flagSet.id ? false : true}
                      draggable={flagSet.id ? false : true}
                      deleteInputGroup={() => deleteFlagFromFlagSet(i, j)}
                      key={j}
                    >
                      <InputRow>
                        <InputRowItem>
                          <Input
                            fullWidth
                            name={`flagSets[${i}].flags[${j}].title`}
                            value={flag.title}
                            onChange={formik.handleChange}
                            placeholder="Flag"
                          />
                        </InputRowItem>
                        {flag.new || !flagSet.id ? (
                          <InputRowItem width={180}>
                            <ColorPicker
                              inline
                              color={flag.color}
                              onChange={(color) =>
                                formik.setFieldValue(
                                  `flagSets[${i}].flags[${j}].color`,
                                  color,
                                )
                              }
                            />
                          </InputRowItem>
                        ) : (
                          <InputRowLabel>
                            <Swatch bgcolor={flag.color} />
                            {flag.color}
                          </InputRowLabel>
                        )}
                      </InputRow>
                      <InputRow>
                        <Input
                          format="data"
                          name={`flagSets[${i}].flags[${j}].dataValue`}
                          value={flag.dataValue}
                          placeholder="data value"
                          onChange={formik.handleChange}
                        />
                      </InputRow>
                    </InputGroup>
                  </Box>
                );
              })}
              <InputRow childRow>
                <Box>
                  <Button onClick={() => addFlagToFlagSet(i)}>add flag</Button>
                </Box>
              </InputRow>
            </Box>
          );
        })}
      </Box>
      <Button onClick={addFlagSet} size="large">
        add flag set
      </Button>
    </form>
  );
};
export default ServiceFlags;
