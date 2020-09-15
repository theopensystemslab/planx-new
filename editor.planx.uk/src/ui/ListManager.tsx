import React, { useRef } from "react";
import { Box, IconButton, Button, makeStyles } from "@material-ui/core";
import { Delete, DragHandle } from "@material-ui/icons";
import arrayMove from "array-move";
import { removeAt, setAt } from "../utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from "react-beautiful-dnd";

export interface EditorProps<T> {
  value: T;
  onChange: (newValue: T) => void;
}

export interface Props<T> {
  values: Array<T>;
  onChange: (newValues: Array<T>) => void;
  newValue: () => T;
  Editor: React.FC<EditorProps<T>>;
}

const useStyles = makeStyles((theme) => ({
  list: {},
  item: {
    display: "flex",
    marginBottom: theme.spacing(1),
  },
}));

function ListManager<T>(props: Props<T>) {
  const { Editor } = props;
  // Initialize a random ID when the component mounts
  const randomId = useRef(String(Math.random()));

  const classes = useStyles();

  return (
    <DragDropContext
      onDragEnd={(dropResult: DropResult) => {
        props.onChange(
          arrayMove(
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
                <Draggable draggableId={String(index)} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      className={classes.item}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <Box>
                        <IconButton disableRipple {...provided.dragHandleProps}>
                          <DragHandle />
                        </IconButton>
                      </Box>
                      <Editor
                        value={item}
                        onChange={(newItem) => {
                          props.onChange(setAt(index, newItem, props.values));
                        }}
                      ></Editor>
                      <Box>
                        <IconButton
                          onClick={() => {
                            props.onChange(removeAt(index, props.values));
                          }}
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
        color="primary"
        variant="contained"
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
      >
        Add new
      </Button>
    </DragDropContext>
  );
}

export default ListManager;
