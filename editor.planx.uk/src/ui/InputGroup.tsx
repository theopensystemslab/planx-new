import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import type { defaultTheme } from "../theme";

const useClasses = makeStyles((theme: typeof defaultTheme) => ({
  inputGroup: {
    border: 0,
    margin: 0,
    padding: 0,
    "& + $inputGroup": {
      marginTop: theme.spacing(2),
    },
    "& $inputGroup + $inputGroup": {
      marginTop: 0,
    },
  },
  content: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",

    "& > *": {
      transition: "opacity 0.2s ease-out",
    },
  },
  label: {
    fontSize: 15,
    padding: theme.spacing(1.5, 0),
  },
  deletable: {
    paddingRight: 52,
    position: "relative",
  },
  draggable: {
    position: "relative",
  },
  deleteBtn: {
    position: "absolute",
    right: 0,
    borderRadius: 0,
    width: 50,
    height: 50,
    top: 0,
    color: theme.palette.text.secondary,
    opacity: 0.75,
  },
  drag: {
    position: "absolute",
    right: "calc(100% + 2px)",
    top: 0,
    width: theme.spacing(4),
    height: theme.spacing(6.25),
    textAlign: "center",
    padding: theme.spacing(1.5, 0.5),
    color: theme.palette.text.secondary,
    opacity: 0.5,
    cursor: "move",
    transition: "opacity 0.2s ease",
    "&:hover, &:focus": {
      opacity: 1,
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  },
  deletePending: {
    "&$deletable > *:not($deleteBtn)": {
      opacity: 0.65,
    },
  },
}));

interface Props {
  children: JSX.Element[] | JSX.Element;
  label?: string;
  grow?: boolean;
  deleteInputGroup?: any;
  deletable?: boolean;
  draggable?: boolean;
  id?: string;
  index?: number;
  handleMove?: (dragIndex: number, hoverIndex: number) => void;
}

export default function InputGroup({
  children,
  label,
  deletable,
  draggable,
  deleteInputGroup,
  id,
  index = 0,
  handleMove,
}: Props): FCReturn {
  const classes = useClasses();
  const [deleteHover, setDeleteHover] = React.useState(false);

  const ref = useRef<HTMLFieldSetElement>(null);

  const [, drop] = useDrop({
    accept: "OPTION",
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        if (handleMove) handleMove(dragIndex, hoverIndex);
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      }
    },
  });

  const [, drag] = useDrag({
    item: {
      id,
      index,
    },
    type: "OPTION",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (draggable) drag(drop(ref));

  return (
    <fieldset className={classNames(classes.inputGroup)} ref={ref}>
      {label && <legend className={classes.label}>{label}</legend>}
      <div
        className={classNames(
          classes.content,
          deletable && classes.deletable,
          draggable && classes.draggable,
          deleteHover && classes.deletePending,
        )}
      >
        {draggable && (
          <Box className={classes.drag}>
            <DragHandle titleAccess="Drag" />
          </Box>
        )}
        {children}
        {deletable && (
          <IconButton
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            onBlur={() => setDeleteHover(false)}
            onFocus={() => setDeleteHover(true)}
            className={classes.deleteBtn}
            onClick={deleteInputGroup}
            aria-label="Delete"
            size="large"
          >
            <Delete />
          </IconButton>
        )}
      </div>
    </fieldset>
  );
}
