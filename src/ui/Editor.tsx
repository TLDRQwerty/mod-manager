import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Level } from "@tiptap/extension-heading";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";
import Select from "./Select";
import {
  TbBold,
  TbClearFormatting,
  TbCode,
  TbItalic,
  TbList,
  TbListNumbers,
  TbPageBreak,
  TbStrikethrough,
} from "react-icons/tb";

const levels: Level[] = [1, 2, 3, 4, 5, 6];
interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

function ToggleButton({
  children,
  active = false,
  ...props
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}): JSX.Element {
  return (
    <button
      className={clsx("border border-black rounded-md px-2 py-1", {
        "bg-gray-800 text-white": active,
      })}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Editor({
  value = "",
  onChange,
}: Props): JSX.Element | null {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (editor == null) {
    return null;
  }

  return (
    <>
      <div className="flex flex-row flex-1">
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <TbBold />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <TbItalic />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <TbStrikethrough />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        >
          <TbCode />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <TbList />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <TbListNumbers />
        </ToggleButton>
        <ToggleButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
        >
          <TbClearFormatting />
        </ToggleButton>
        <ToggleButton onClick={() => editor.chain().setHorizontalRule().run()}>
          <TbPageBreak />
        </ToggleButton>
        <Select
          buttonClassName="border border-black rounded-md px-2 py-1 bg-white"
          value={editor.getAttributes("heading")?.level as Level | undefined}
          options={levels}
          onChange={(level) => {
            if (level != null) {
              editor.chain().focus().setHeading({ level }).run();
            }
          }}
          renderValue={(level) =>
            level != null ? (
              <Fragment>Heading {level}</Fragment>
            ) : (
              <Fragment>None</Fragment>
            )
          }
          renderOption={(level) => <Fragment>Heading {level}</Fragment>}
          getKey={(level) => level?.toString() ?? "-"}
        />
      </div>
      <EditorContent
        editor={editor}
        className="border border-gray-200 rounded-lg m-2 p-2"
      />
    </>
  );
}
