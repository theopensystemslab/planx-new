import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { arrayMoveImmutable } from "array-move";
import { nanoid } from "nanoid";
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

export interface EditorProps<T> {
  index: number;
  value: T;
  onChange: (newValue: T) => void;
  disabled?: boolean;
}

export interface Props<T, EditorExtraProps = {}> {
  values: Array<T>;
  onChange: (newValues: Array<T>) => void;
  newValue: () => T;
  newValueLabel?: string;
  Editor: React.FC<EditorProps<T> & (EditorExtraProps | {})>;
  editorExtraProps?: EditorExtraProps;
  noDragAndDrop?: boolean;
  isFieldDisabled?: (item: T, index: number) => boolean;
  maxItems?: number;
  disabled?: boolean;
}

const Item = styled(Box)(() => ({
  display: "flex",
}));

const InsertButtonRoot = styled(ButtonBase)(({ theme }) => ({
  justifyContent: "space-between",
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(2),
  width: "100%",
  height: theme.spacing(3),
  color: theme.palette.grey[600],
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
  width: "91%",
  opacity: 0,
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
      <AddIcon sx={{ transform: `translateX(-6px)` }} />
    </InsertButtonRoot>
  );
};

export default function ListManager<T, EditorExtraProps>(
  props: Props<T, EditorExtraProps>,
) {
  const { Editor, maxItems = Infinity, disabled } = props;
  // Initialize a random ID when the component mounts
  const randomId = useRef(nanoid());

  // Unique keys are required for transition group
  // Index is an unstable key because new items can be inserted into the list
  const [itemKeys, setItemKeys] = useState<string[]>(
    props.values.map(() => nanoid()),
  );

  const isMaxLength = props.values.length >= maxItems;
  const [isDragging, setIsDragging] = useState(false);

  return props.noDragAndDrop ? (
    <>
      <Box>
        <TransitionGroup>
          {props.values.map((item, index) => (
            <Collapse key={itemKeys[index]}>
              <Item>
                <Editor
                  index={index}
                  value={item}
                  onChange={(newItem) => {
                    props.onChange(setAt(index, newItem, props.values));
                  }}
                  {...(props.editorExtraProps || {})}
                />
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <IconButton
                    onClick={() => {
                      props.onChange(removeAt(index, props.values));
                      setItemKeys((prev) => prev.filter((_, i) => i !== index));
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
          ))}
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
  ) : (
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
              {props.values.map((item, index) => (
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
                        >
                          <Box>
                            <IconButton
                              disableRipple
                              {...(props.noDragAndDrop
                                ? { disabled: true || disabled }
                                : provided.dragHandleProps)}
                              aria-label="Drag"
                              size="large"
                              disabled={disabled}
                            >
                              <DragHandle />
                            </IconButton>
                          </Box>
                          <Editor
                            index={index}
                            value={item}
                            onChange={(newItem) => {
                              props.onChange(
                                setAt(index, newItem, props.values),
                              );
                            }}
                            {...(props.editorExtraProps || {})}
                          />
                          <Box>
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
                                disabled ||
                                props?.isFieldDisabled?.(item, index)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Item>
                      )}
                    </Draggable>
                  </Box>
                </Collapse>
              ))}
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
  );
}
