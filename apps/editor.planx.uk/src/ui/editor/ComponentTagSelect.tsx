import BookmarksIcon from "@mui/icons-material/Bookmarks";
import type { AutocompleteProps } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import type { NodeTag, Role } from "@opensystemslab/planx-core/types";
import { NODE_TAGS } from "@opensystemslab/planx-core/types";
import { useCurrentTeamRole } from "hooks/useCurrentTeamRole";
import { TAG_DISPLAY_VALUES } from "pages/FlowEditor/components/Flow/components/Tag";
import { getContrastTextColor } from "styleUtils";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { RenderOptionCheckbox } from "ui/shared/Autocomplete/components/RenderOptionCheckbox";
import InputRow from "ui/shared/InputRow";
import { SelectMultiple } from "ui/shared/SelectMultiple";

interface Props {
  value?: NodeTag[];
  onChange: (values: NodeTag[]) => void;
  disabled?: boolean;
}

type RenderOption = NonNullable<
  AutocompleteProps<NodeTag, true, true, false, "div">["renderOption"]
>;

type RenderValue = NonNullable<
  AutocompleteProps<NodeTag, true, true, false, "div">["renderValue"]
>;

const isEditableByRole = (tag: NodeTag, userRole?: Role) =>
  !TAG_DISPLAY_VALUES[tag].editableBy?.some((role) => role !== userRole);

const renderOption = (
  userRole: Role | undefined,
  ...[props, tag, state]: Parameters<RenderOption>
): ReturnType<RenderOption> => {
  if (!isEditableByRole(tag, userRole)) return null;

  return (
    <RenderOptionCheckbox
      key={props.key}
      listProps={props}
      displayName={TAG_DISPLAY_VALUES[tag].displayName}
      state={state}
    />
  );
};

const renderValue = (
  userRole: Role | undefined,
  ...[value, getTagProps]: Parameters<RenderValue>
): ReturnType<RenderValue> =>
  (value as NodeTag[]).map((tag, index) => {
    return (
      <Chip
        {...getTagProps({ index })}
        data-testid={
          TAG_DISPLAY_VALUES[tag].displayName.toLowerCase() + "-chip"
        }
        key={tag}
        label={TAG_DISPLAY_VALUES[tag].displayName}
        sx={(theme) => ({
          backgroundColor: theme.palette.nodeTag[TAG_DISPLAY_VALUES[tag].color],
          color: getContrastTextColor(
            theme.palette.nodeTag[TAG_DISPLAY_VALUES[tag].color],
            "#FFF",
          ),
        })}
        onDelete={
          isEditableByRole(tag, userRole)
            ? getTagProps({ index }).onDelete
            : undefined
        }
      />
    );
  });

export const ComponentTagSelect: React.FC<Props> = ({
  value,
  onChange,
  disabled,
}) => {
  const userRole = useCurrentTeamRole();

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
            renderOption={(...args) => renderOption(userRole, ...args)}
            renderValue={(...args) => renderValue(userRole, ...args)}
            disabled={disabled}
          />
        </InputRow>
      </ModalSectionContent>
    </ModalSection>
  );
};
