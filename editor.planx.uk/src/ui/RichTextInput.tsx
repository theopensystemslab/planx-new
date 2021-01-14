import "@draft-js-plugins/inline-toolbar/lib/plugin.css";
import "draft-js/dist/Draft.css";

import createLinkPlugin from "@draft-js-plugins/anchor";
import {
  BoldButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  ItalicButton,
  OrderedListButton,
  UnorderedListButton,
} from "@draft-js-plugins/buttons";
import PluginsEditor from "@draft-js-plugins/editor";
import createInlineToolbarPlugin from "@draft-js-plugins/inline-toolbar";
import Box from "@material-ui/core/Box";
import { InputBaseProps } from "@material-ui/core/InputBase";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import {
  CompositeDecorator,
  ContentState,
  convertFromHTML,
  convertToRaw,
  EditorState,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  bordered?: boolean;
}

const useClasses = makeStyles((theme) => ({
  regular: {
    position: "relative",
    boxSizing: "border-box",
    // This is necessary for the focus styles to be visible. Breaks the layout a bit
    // unfortunately. TODO: find a better solution.
    padding: 10,
    outline: "none",
    backgroundColor: theme.palette.background.default,
    width: "100%",
    "&:focus-within": {
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
  bordered: {
    border: `2px solid #000`,
  },
}));

function findLinkEntities(contentBlock: any, callback: any, contentState: any) {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}

const Link = (props: {
  contentState: ContentState;
  entityKey: any;
  children: ReactElement;
}) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url} target="_blank" style={{ color: "inherit" }}>
      {props.children}
    </a>
  );
};

const decorators = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

const valueToContentState = (value: string): ContentState => {
  const blocksFromHTML = convertFromHTML(value);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  return state;
};

const RichTextInput: React.FC<Props> = (props) => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createWithContent(
      valueToContentState((props.value as string) || ""),
      decorators
    )
  );

  // If the editor is changed from the outside, synchronize internal state
  useEffect(() => {
    const currentHtml = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    if (currentHtml !== props.value) {
      setEditorState(
        EditorState.createWithContent(
          valueToContentState((props.value as string) || ""),
          decorators
        )
      );
    }
  }, [props.value]);

  const linkPlugin = useMemo(
    () =>
      createLinkPlugin({
        placeholder: "https://",
      }),
    []
  );

  const inlineToolbarPlugin = useMemo(() => createInlineToolbarPlugin(), [
    linkPlugin,
  ]);

  const classes = useClasses();

  return (
    <Box
      className={classNames(
        classes.regular,
        props.bordered ? classes.bordered : undefined
      )}
    >
      <PluginsEditor
        plugins={[inlineToolbarPlugin, linkPlugin]}
        editorState={editorState}
        placeholder={props.placeholder}
        onChange={(newEditorState) => {
          const newHtmlContent = draftToHtml(
            convertToRaw(newEditorState.getCurrentContent())
          );

          const newHtmlContentNonEmpty =
            newHtmlContent === "<p></p>" ? "" : newHtmlContent;

          if (props.onChange && newHtmlContent !== props.value) {
            const changeEvent = ({
              target: {
                name: props.name,
                value: newHtmlContentNonEmpty,
              },
            } as unknown) as ChangeEvent<HTMLInputElement>;
            props.onChange(changeEvent);
          }
          setEditorState(newEditorState);
        }}
        spellCheck={false}
      />
      <inlineToolbarPlugin.InlineToolbar>
        {(externalProps: any) => (
          <>
            <HeadlineOneButton {...externalProps} />
            <HeadlineTwoButton {...externalProps} />
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <linkPlugin.LinkButton {...externalProps} />
          </>
        )}
      </inlineToolbarPlugin.InlineToolbar>
    </Box>
  );
};

export default RichTextInput;
