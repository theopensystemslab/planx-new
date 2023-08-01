import Delete from "@mui/icons-material/Delete";
import DragHandle from "@mui/icons-material/DragHandle";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

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

const Root = styled("fieldset")(({ theme }) => ({
  border: 0,
  margin: 0,
  padding: 0,
  "& + .inputGroup": {
    marginTop: theme.spacing(2),
  },
  "& .inputGroup + .inputGroup": {
    marginTop: 0,
  },
}));

const Label = styled("legend")(({ theme }) => ({
  fontSize: 15,
  padding: theme.spacing(1.5, 0),
}));

const Drag = styled(Box)(({ theme }) => ({
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
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 0,
  borderRadius: 0,
  width: 50,
  height: 50,
  top: 0,
  color: theme.palette.text.secondary,
  opacity: 0.75,
}));

interface BaseContentProps {
  deletable?: boolean;
  draggable?: boolean;
  deleteHover?: boolean;
}

type ContentProps = PropsWithChildren<BoxProps & BaseContentProps>;

const Content = styled(Box, {
  shouldForwardProp: (prop) =>
    !["deletable", "draggable", "deleteHover"].includes(prop.toString()),
})<ContentProps>(({ deletable, draggable, deleteHover }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  "& > *": {
    transition: "opacity 0.2s ease-out",
  },
  ...(deletable && {
    paddingRight: 52,
    position: "relative",
  }),
  ...(draggable && {
    position: "relative",
  }),
  ...(deleteHover &&
    deletable && {
      "& > *:not(.deleteButton)": {
        opacity: 0.65,
      },
    }),
}));

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
    <Root ref={ref} className="inputGroup">
      {label && <Label>{label}</Label>}
      <Content
        deletable={deletable}
        draggable={draggable}
        deleteHover={deleteHover}
      >
        {draggable && (
          <Drag>
            <DragHandle titleAccess="Drag" />
          </Drag>
        )}
        {children}
        {deletable && (
          <DeleteButton
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            onBlur={() => setDeleteHover(false)}
            onFocus={() => setDeleteHover(true)}
            onClick={deleteInputGroup}
            aria-label="Delete"
            size="large"
            className="deleteButton"
          >
            <Delete />
          </DeleteButton>
        )}
      </Content>
    </Root>
  );
}
