import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { arrayMoveImmutable } from "array-move";
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

import { insertAt, removeAt, setAt } from "../../../utils";

export interface EditorProps<T> {
  index: number;
  value: T;
  onChange: (newValue: T) => void;
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
}

const Item = styled(Box)(({ theme }) => ({
  display: "flex",
  "&:last-child": {
    marginBottom: theme.spacing(2),
  },
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
  const { Editor, maxItems = Infinity } = props;
  // Initialize a random ID when the component mounts
  const randomId = useRef(String(Math.random()));

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];
  const isViewOnly = !useStore.getState().canUserEditTeam(teamSlug);
  const isMaxLength = props.values.length >= maxItems;
  const [isDragging, setIsDragging] = useState(false);

  return props.noDragAndDrop ? (
    <>
      <Box>
        {props.values.map((item, index) => {
          return (
            <Item key={index}>
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
                  }}
                  aria-label="Delete"
                  size="large"
                  disabled={isViewOnly || props?.isFieldDisabled?.(item, index)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Item>
          );
        })}
      </Box>
      <Button
        sx={{ mt: 2 }}
        size="large"
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
        disabled={isViewOnly || isMaxLength}
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
      }}
    >
      <Droppable droppableId={randomId.current}>
        {(provided: DroppableProvided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {props.values.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  {Boolean(index) && (
                    <InsertButton
                      disabled={isViewOnly || isMaxLength}
                      handleClick={() => {
                        props.onChange(
                          insertAt(index, props.newValue(), props.values),
                        );
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
                              ? { disabled: true || isViewOnly }
                              : provided.dragHandleProps)}
                            aria-label="Drag"
                            size="large"
                            disabled={isViewOnly}
                          >
                            <DragHandle />
                          </IconButton>
                        </Box>
                        <Editor
                          index={index}
                          value={item}
                          onChange={(newItem) => {
                            props.onChange(setAt(index, newItem, props.values));
                          }}
                          {...(props.editorExtraProps || {})}
                        />
                        <Box>
                          <IconButton
                            onClick={() => {
                              props.onChange(removeAt(index, props.values));
                            }}
                            aria-label="Delete"
                            size="large"
                            disabled={
                              isViewOnly ||
                              props?.isFieldDisabled?.(item, index)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Item>
                    )}
                  </Draggable>
                </React.Fragment>
              );
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
      <Button
        size="medium"
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
        disabled={isViewOnly || isMaxLength}
      >
        {props.newValueLabel || "add new"}
      </Button>
    </DragDropContext>
  );
}
