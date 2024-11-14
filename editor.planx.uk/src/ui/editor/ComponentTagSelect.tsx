import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { AutocompleteProps } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import { NODE_TAGS, NodeTag } from "@opensystemslab/planx-core/types";
import { TAG_DISPLAY_VALUES } from "pages/FlowEditor/components/Flow/components/Tag";
import { useStore } from "pages/FlowEditor/lib/store";
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

export const ComponentTagSelect: React.FC<Props> = ({ value, onChange }) => {
  const isPlatformAdmin = useStore().user?.isPlatformAdmin;

  const renderOption: AutocompleteProps<
    NodeTag,
    true,
    true,
    false,
    "div"
  >["renderOption"] = (props, tag, { selected }) => {
    const tagName = TAG_DISPLAY_VALUES[tag].displayName;

    if (tagName === "Placeholder" && !isPlatformAdmin) {
      return null;
    }

    return (
      <ListItem {...props}>
        <CustomCheckbox
          aria-hidden="true"
          className={selected ? "selected" : ""}
        />
        {TAG_DISPLAY_VALUES[tag].displayName}
      </ListItem>
    );
  };

  const renderTags: AutocompleteProps<
    NodeTag,
    true,
    true,
    false,
    "div"
  >["renderTags"] = (value, getTagProps) =>
    value.map((tag, index) => {
      const tagName = TAG_DISPLAY_VALUES[tag].displayName;
      const isChipDisabled = tagName === "Placeholder" && !isPlatformAdmin;

      return (
        <Chip
          {...getTagProps({ index })}
          key={tag}
          label={TAG_DISPLAY_VALUES[tag].displayName}
          sx={(theme) => ({
            backgroundColor:
              theme.palette.nodeTag[TAG_DISPLAY_VALUES[tag].color],
            color: getContrastTextColor(
              theme.palette.nodeTag[TAG_DISPLAY_VALUES[tag].color],
              "#FFF",
            ),
          })}
          onDelete={
            isChipDisabled ? undefined : getTagProps({ index }).onDelete
          }
        />
      );
    });

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
