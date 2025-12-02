import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { arrayMoveImmutable } from "array-move";
import { FormikErrors } from "formik";
import { nanoid } from "nanoid";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";
import { TransitionGroup } from "react-transition-group";

import { insertAt, removeAt, setAt } from "../../../utils";
import { ListManagerHeader } from "./ListManagerHeader";
import { useScrollToOptionOrGroup } from "./useScrollToOptionOrGroup";

export interface EditorProps<T> {
  index: number;
  errors: string | string[] | FormikErrors<T> | undefined;
  value: T;
  onChange: (newValue: T) => void;
  disabled?: boolean;
  isCollapsed?: boolean;
}

export interface Props<T, EditorExtraProps = {}> {
  values: Array<T>;
  errors?: string | string[] | FormikErrors<T>[] | undefined;
  onChange: (newValues: Array<T>) => void;
  newValue: () => T;
  newValueLabel?: string;
  Editor: React.FC<EditorProps<T> & (EditorExtraProps | {})>;
  editorExtraProps?: EditorExtraProps;
  noDragAndDrop?: boolean;
  isFieldDisabled?: (item: T, index: number) => boolean;
  maxItems?: number;
  disabled?: boolean;
  isTemplatedNode?: boolean;
  /**
   * Allow list items to be skipped from the list
   * @example Presenting two filtered lists (e.g. GovPayMetadata)
   */
  isFieldDisplayed?: (item: T) => boolean;
  /**
   * Enable collapse/expand functionality for list items
   * @default false
   */
  collapsible?: boolean;
}

const Item = styled(Box)(() => ({
  display: "flex",
}));

const InsertButtonRoot = styled(ButtonBase)(({ theme }) => ({
  justifyContent: "space-between",
  width: "100%",
  paddingLeft: theme.spacing(4.8),
  height: theme.spacing(3),
  color: "transparent",
  transition:
    "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    opacity: 1,
    color: theme.palette.primary.main,
    "& hr": {
      opacity: 1,
    },
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  border: `1px dashed ${theme.palette.primary.main}`,
  width: "100%",
  opacity: 0,
  margin: 0,
  transition: "inherit",
}));

const InsertButton: React.FC<{
  handleClick: () => void;
  disabled: boolean;
  isDragging: boolean;
}> = ({ handleClick, disabled, isDragging }) => {
  return (
    <InsertButtonRoot
      onClick={handleClick}
      disabled={disabled}
      disableRipple
      tabIndex={-1}
      sx={{
        opacity: isDragging ? 0 : 1,
        visibility: isDragging ? "hidden" : "visible",
      }}
    >
      <StyledDivider variant="middle" />
      <Box
        sx={(theme) => ({
          width: "32px",
          position: "absolute",
          left: "50%",
          background: theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <AddCircleOutlineIcon />
      </Box>
    </InsertButtonRoot>
  );
};

export default function ListManager<T, EditorExtraProps>(
  props: Props<T, EditorExtraProps>,
) {
  const {
    Editor,
    maxItems = Infinity,
    disabled,
    isFieldDisplayed = () => true,
    collapsible = false,
  } = props;
  // Initialize a random ID when the component mounts
  const randomId = useRef(nanoid());

  // Unique keys are required for transition group
  // Index is an unstable key because new items can be inserted into the list
  const [itemKeys, setItemKeys] = useState<string[]>(
    props.values.map(() => nanoid()),
  );

  // Track collapsed state for each item using their keys
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  const isMaxLength = props.values.length >= maxItems;
  const [isDragging, setIsDragging] = useState(false);

  const [isTemplate, isPlatformAdmin] = useStore((state) => [
    state.isTemplate,
    state.user?.isPlatformAdmin,
  ]);

  useScrollToOptionOrGroup();

  const toggleCollapse = (key: string) => {
    setCollapsedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const collapseAll = () => {
    setCollapsedItems(new Set(itemKeys));
  };

  const expandAll = () => {
    setCollapsedItems(new Set());
  };

  // Compute button states - account for filtered items
  const visibleItemCount = props.values.filter(isFieldDisplayed).length;
  const hasItems = visibleItemCount > 0;
  const allCollapsed = hasItems && collapsedItems.size === itemKeys.length;
  const allExpanded = hasItems && collapsedItems.size === 0;

  // `isTemplatedNode` disables reordering, adding, and deleting options in the templated flow unless you're a platform admin or in the source template
  if (props.isTemplatedNode && !isPlatformAdmin && !isTemplate) {
    return (
      <>
        {collapsible && hasItems && (
          <ListManagerHeader
            disabled={disabled}
            hasItems={hasItems}
            allCollapsed={allCollapsed}
            allExpanded={allExpanded}
            onCollapseAll={collapseAll}
            onExpandAll={expandAll}
          />
        )}
        <Box>
          <TransitionGroup>
            {props.values.map((item, index) =>
              isFieldDisplayed(item) ? (
                <Collapse key={itemKeys[index]} sx={{ marginBottom: 2 }}>
                  <Item>
                    {collapsible && (
                      <Box>
                        <IconButton
                          onClick={() => toggleCollapse(itemKeys[index])}
                          aria-label={
                            collapsedItems.has(itemKeys[index])
                              ? "Expand"
                              : "Collapse"
                          }
                          size="large"
                          disabled={disabled}
                        >
                          {collapsedItems.has(itemKeys[index]) ? (
                            <ExpandMore />
                          ) : (
                            <ExpandLess />
                          )}
                        </IconButton>
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Editor
                        index={index}
                        value={item}
                        onChange={(newItem) => {
                          props.onChange(setAt(index, newItem, props.values));
                        }}
                        {...(props.editorExtraProps || {})}
                        disabled={disabled}
                        errors={props.errors?.[index]}
                        isCollapsed={
                          collapsible
                            ? collapsedItems.has(itemKeys[index])
                            : false
                        }
                      />
                    </Box>
                  </Item>
                </Collapse>
              ) : null,
            )}
          </TransitionGroup>
        </Box>
      </>
    );
  }

  // `noDragAndDrop` disables reordering, but allows adding and deleting options
  if (props.noDragAndDrop) {
    return (
      <>
        {collapsible && hasItems && (
          <ListManagerHeader
            disabled={disabled}
            hasItems={hasItems}
            allCollapsed={allCollapsed}
            allExpanded={allExpanded}
            onCollapseAll={collapseAll}
            onExpandAll={expandAll}
          />
        )}
        <Box>
          <TransitionGroup>
            {props.values.map((item, index) =>
              isFieldDisplayed(item) ? (
                <Collapse key={itemKeys[index]}>
                  <Item>
                    {collapsible && (
                      <Box>
                        <IconButton
                          onClick={() => toggleCollapse(itemKeys[index])}
                          aria-label={
                            collapsedItems.has(itemKeys[index])
                              ? "Expand"
                              : "Collapse"
                          }
                          size="large"
                          disabled={disabled}
                        >
                          {collapsedItems.has(itemKeys[index]) ? (
                            <ExpandMore />
                          ) : (
                            <ExpandLess />
                          )}
                        </IconButton>
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Editor
                        index={index}
                        value={item}
                        onChange={(newItem) => {
                          props.onChange(setAt(index, newItem, props.values));
                        }}
                        {...(props.editorExtraProps || {})}
                        disabled={disabled}
                        errors={props.errors?.[index]}
                        isCollapsed={
                          collapsible
                            ? collapsedItems.has(itemKeys[index])
                            : false
                        }
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <IconButton
                        onClick={() => {
                          props.onChange(removeAt(index, props.values));
                          setItemKeys((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        aria-label="Delete"
                        size="large"
                        disabled={
                          disabled || props?.isFieldDisabled?.(item, index)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Item>
                </Collapse>
              ) : null,
            )}
          </TransitionGroup>
        </Box>
        <Button
          sx={{ mt: 2 }}
          size="large"
          onClick={() => {
            props.onChange([...props.values, props.newValue()]);
            setItemKeys((prev) => [...prev, nanoid()]);
          }}
          disabled={disabled || isMaxLength}
        >
          {props.newValueLabel || "add new"}
        </Button>
      </>
    );
  }

  // Default ListManager supports reordering, adding, and deleting options
  return (
    <>
      {collapsible && hasItems && (
        <ListManagerHeader
          disabled={disabled}
          hasItems={hasItems}
          allCollapsed={allCollapsed}
          allExpanded={allExpanded}
          onCollapseAll={collapseAll}
          onExpandAll={expandAll}
        />
      )}
      <DragDropContext
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(dropResult: DropResult) => {
          setIsDragging(false);
          if (!dropResult.source || !dropResult.destination) {
            return;
          }
          props.onChange(
            arrayMoveImmutable(
              props.values,
              dropResult.source.index,
              dropResult.destination.index,
            ),
          );

          // Adjust keys when dragging
          setItemKeys((prev) => {
            const newKeys = [...prev];
            const [movedKey] = newKeys.splice(dropResult.source.index, 1);
            newKeys.splice(dropResult!.destination!.index!, 0, movedKey);
            return newKeys;
          });
        }}
      >
        <Droppable droppableId={randomId.current}>
          {(provided: DroppableProvided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              <TransitionGroup>
                {props.values.map((item, index) =>
                  isFieldDisplayed(item) ? (
                    <Collapse key={itemKeys[index]}>
                      <Box>
                        {Boolean(index) && (
                          <InsertButton
                            disabled={disabled || isMaxLength}
                            handleClick={() => {
                              props.onChange(
                                insertAt(index, props.newValue(), props.values),
                              );
                              setItemKeys((prev) => {
                                const newKeys = [...prev];
                                newKeys.splice(index, 0, nanoid());
                                return newKeys;
                              });
                            }}
                            isDragging={isDragging}
                          />
                        )}
                        <Draggable
                          draggableId={String(index)}
                          index={index}
                          key={index}
                        >
                          {(provided: DraggableProvided) => (
                            <Item
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              sx={{ ml: -5 }}
                            >
                              <Box
                                {...(!props.noDragAndDrop
                                  ? provided.dragHandleProps
                                  : {})}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "flex-start",
                                  cursor: "grab",
                                  "&:active": {
                                    cursor: props.noDragAndDrop
                                      ? "default"
                                      : "grabbing",
                                  },
                                }}
                              >
                                <IconButton
                                  disableRipple
                                  aria-label="Drag"
                                  size="large"
                                  disabled={disabled || props.noDragAndDrop}
                                  sx={{
                                    pointerEvents: "none",
                                    "&:hover": {
                                      backgroundColor: `rgba(0, 0, 0, 0.04)`,
                                    },
                                  }}
                                >
                                  <DragHandle />
                                </IconButton>
                              </Box>
                              <Box
                                sx={{
                                  width: "100%",
                                  minWidth: "100%",
                                  display: "flex",
                                }}
                              >
                                {collapsible && (
                                  <Box>
                                    <IconButton
                                      onClick={() =>
                                        toggleCollapse(itemKeys[index])
                                      }
                                      aria-label={
                                        collapsedItems.has(itemKeys[index])
                                          ? "Expand"
                                          : "Collapse"
                                      }
                                      size="large"
                                      disabled={disabled}
                                    >
                                      {collapsedItems.has(itemKeys[index]) ? (
                                        <ExpandMore />
                                      ) : (
                                        <ExpandLess />
                                      )}
                                    </IconButton>
                                  </Box>
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Editor
                                    index={index}
                                    value={item}
                                    onChange={(newItem) => {
                                      props.onChange(
                                        setAt(index, newItem, props.values),
                                      );
                                    }}
                                    {...(props.editorExtraProps || {})}
                                    disabled={disabled}
                                    errors={props.errors?.[index]}
                                    isCollapsed={
                                      collapsible
                                        ? collapsedItems.has(itemKeys[index])
                                        : false
                                    }
                                  />
                                </Box>
                                <Box>
                                  <IconButton
                                    onClick={() => {
                                      props.onChange(
                                        removeAt(index, props.values),
                                      );
                                      setItemKeys((prev) =>
                                        prev.filter((_, i) => i !== index),
                                      );
                                    }}
                                    aria-label="Delete"
                                    size="large"
                                    disabled={
                                      disabled ||
                                      props?.isFieldDisabled?.(item, index)
                                    }
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Item>
                          )}
                        </Draggable>
                      </Box>
                    </Collapse>
                  ) : null,
                )}
                {provided.placeholder}
              </TransitionGroup>
            </Box>
          )}
        </Droppable>
        <Button
          size="medium"
          sx={{ mt: 2 }}
          onClick={() => {
            props.onChange([...props.values, props.newValue()]);
            setItemKeys((prev) => [...prev, nanoid()]);
          }}
          disabled={disabled || isMaxLength}
        >
          {props.newValueLabel || "add new"}
        </Button>
      </DragDropContext>
    </>
  );
}
