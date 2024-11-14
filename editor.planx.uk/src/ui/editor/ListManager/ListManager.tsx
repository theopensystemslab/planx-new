import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { arrayMoveImmutable } from "array-move";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";

import { removeAt, setAt } from "../../../utils";

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
  disableDragAndDrop?: boolean;
  isFieldDisabled?: (item: T, index: number) => boolean;
  maxItems?: number;
}

const Item = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
}));

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

  return props.disableDragAndDrop ? (
    <>
      <Box>
        {props.values.map((item, index) => {
          return (
            <Item key={index}>
              <Box>
                <IconButton
                  disableRipple
                  disabled={true || isViewOnly}
                  aria-label="Drag"
                  size="large"
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
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <IconButton
                  onClick={() => {
                    props.onChange(removeAt(index, props.values));
                  }}
                  aria-label="Delete"
                  size="large"
                  disabled={
                    isViewOnly ||
                    (props?.isFieldDisabled &&
                      props.isFieldDisabled(item, index))
                  }
                >
                  <Delete />
                </IconButton>
              </Box>
            </Item>
          );
        })}
      </Box>
      <Button
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
      onDragEnd={(dropResult: DropResult) => {
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
                <Draggable
                  draggableId={String(index)}
                  index={index}
                  key={index}
                >
                  {(provided: DraggableProvided) => (
                    <Item {...provided.draggableProps} ref={provided.innerRef}>
                      <Box>
                        <IconButton
                          disableRipple
                          {...(!props.disableDragAndDrop
                            ? provided.dragHandleProps
                            : { disabled: true || isViewOnly })}
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
                            (props?.isFieldDisabled &&
                              props.isFieldDisabled(item, index))
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Item>
                  )}
                </Draggable>
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
