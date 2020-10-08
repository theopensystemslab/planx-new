import React, { useRef } from "react";
import { Box, IconButton, Button, makeStyles } from "@material-ui/core";
import { Delete, DragHandle, Add } from "@material-ui/icons";
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

export interface Props<T, EditorExtraProps = {}> {
  values: Array<T>;
  onChange: (newValues: Array<T>) => void;
  newValue: () => T;
  newValueLabel?: string;
  Editor: React.FC<EditorProps<T> & EditorExtraProps>;
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

function ListManager<T, EditorExtraProps>(props: Props<T, EditorExtraProps>) {
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
                        >
                          <DragHandle />
                        </IconButton>
                      </Box>
                      <Editor
                        value={item}
                        onChange={(newItem) => {
                          props.onChange(setAt(index, newItem, props.values));
                        }}
                        {...props.editorExtraProps}
                      />
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
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<Add />}
        onClick={() => {
          props.onChange([...props.values, props.newValue()]);
        }}
      >
        {props.newValueLabel || "Add new"}
      </Button>
    </DragDropContext>
  );
}

export default ListManager;
