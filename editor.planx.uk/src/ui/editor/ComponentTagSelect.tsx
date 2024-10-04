import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { AutocompleteProps } from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import { NODE_TAGS, NodeTag } from "@opensystemslab/planx-core/types";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputRow from "ui/shared/InputRow";
import { CustomCheckbox, SelectMultiple } from "ui/shared/SelectMultiple";

interface Props {
  value?: NodeTag[];
  onChange: (values: NodeTag[]) => void;
};

const renderOption: AutocompleteProps<
  NodeTag,
  true,
  true,
  false,
  "div"
>["renderOption"] = (props, tag, { selected }) => (
  <ListItem {...props}>
    <CustomCheckbox aria-hidden="true" className={selected ? "selected" : ""} />
    {tag}
  </ListItem>
);

export const ComponentTagSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Tags" Icon={BookmarksIcon}>
        <InputRow>
          <SelectMultiple
            label="Tag this component"
            options={NODE_TAGS}
            onChange={(_e, value) => onChange(value)}
            value={value}
            renderOption={renderOption}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  )
}