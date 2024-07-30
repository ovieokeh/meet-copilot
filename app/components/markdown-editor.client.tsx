import "@mdxeditor/editor/style.css";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import { useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";

const MarkdownEditor = ({
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const ref = useRef<MDXEditorMethods>(null);

  return (
    <ClientOnly fallback={<p>Loading...</p>}>
      {() => (
        <MDXEditor
          ref={ref}
          onChange={(value) => onChange(value || "")}
          className="bg-slate-50 p-3 z-20"
          markdown={value}
          plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <UndoRedo />
                </>
              ),
            }),
            headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
            listsPlugin(),
            thematicBreakPlugin(),
          ]}
        />
      )}
    </ClientOnly>
  );
};

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
