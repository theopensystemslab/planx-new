import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { AutocompleteProps } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import { NODE_TAGS, NodeTag } from "@opensystemslab/planx-core/types";
import { TAG_DISPLAY_VALUES } from "pages/FlowEditor/components/Flow/components/Tag";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import InputRow from "ui/shared/InputRow";
import { CustomCheckbox, SelectMultiple } from "ui/shared/SelectMultiple";

interface Props {
  value?: NodeTag[];
  onChange: (values: NodeTag[]) => void;
}

const renderOption: AutocompleteProps<
  NodeTag,
  true,
  true,
  false,
  "div"
>["renderOption"] = (props, tag, { selected }) => (
  <ListItem {...props}>
    <CustomCheckbox aria-hidden="true" className={selected ? "selected" : ""} />
    {TAG_DISPLAY_VALUES[tag].displayName}
  </ListItem>
);

const renderTags: AutocompleteProps<
  NodeTag,
  true,
  true,
  false,
  "div"
>["renderTags"] = (value, getTagProps) =>
  value.map((tag, index) => (
    <Chip
      {...getTagProps({ index })}
      key={tag}
      label={TAG_DISPLAY_VALUES[tag].displayName}
      sx={{
        backgroundColor: TAG_DISPLAY_VALUES[tag].color,
        color: getContrastTextColor(TAG_DISPLAY_VALUES[tag].color, "#FFF"),
      }}
    />
  ));

export const ComponentTagSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Tags" Icon={BookmarksIcon}>
        <InputRow>
          <SelectMultiple
            label="Tag this component"
            getOptionLabel={(tag) => TAG_DISPLAY_VALUES[tag].displayName}
            options={NODE_TAGS}
            onChange={(_e, value) => onChange(value)}
            value={value}
            renderOption={renderOption}
            renderTags={renderTags}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};
