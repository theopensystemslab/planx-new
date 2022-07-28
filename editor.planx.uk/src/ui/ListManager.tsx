import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Delete from "@material-ui/icons/Delete";
import DragHandle from "@material-ui/icons/DragHandle";
import { arrayMoveImmutable } from "array-move";
import React, { useRef } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";

import { removeAt, setAt } from "../utils";

export interface EditorProps<T> {
  index?: number;
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
}

const useStyles = makeStyles((theme) => ({
  list: {},
  item: {
    display: "flex",
    marginBottom: theme.spacing(1),
  },
}));

export default function ListManager<T, EditorExtraProps>(
  props: Props<T, EditorExtraProps>
) {
  const { Editor } = props;
  // Initialize a random ID when the component mounts
  const randomId = useRef(String(Math.random()));

  const classes = useStyles();

  return props.disableDragAndDrop ? (
    <>
      <div className={classes.list}>
        {props.values.map((item, index) => {
          return (
            <div className={classes.item} key={index}>
              <Box>
                <IconButton disableRipple disabled={true} aria-label="Drag">
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
                >
                  <Delete />
                </IconButton>
              </Box>
            </div>
          );
        })}
      </div>
      <Button
        size="large"
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
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
            dropResult.destination.index
          )
        );
      }}
    >
      <Droppable droppableId={randomId.current}>
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            className={classes.list}
            {...provided.droppableProps}
          >
            {props.values.map((item, index) => {
              return (
                <Draggable
                  draggableId={String(index)}
                  index={index}
                  key={index}
                >
                  {(provided: DraggableProvided) => (
                    <div
                      className={classes.item}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <Box>
                        <IconButton
                          disableRipple
                          {...(!props.disableDragAndDrop
                            ? provided.dragHandleProps
                            : { disabled: true })}
                          aria-label="Drag"
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
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <Button
        size="large"
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
      >
        {props.newValueLabel || "add new"}
      </Button>
    </DragDropContext>
  );
}
