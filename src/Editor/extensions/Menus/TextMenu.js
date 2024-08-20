import { BubbleMenu } from "@tiptap/react";
import LinkInput from "./MenuButtons/LinkDropdown/LinkButtonRadix";
// import FontFormatButton from "./MenuButtons/FontFormatDropdown/FontFormatButton";
// import MergeTagsButton from "./MenuButtons/MergeTags/MergeTagsButton";
import { TextSelection } from "@tiptap/pm/state";
import { styled } from "@stitches/react";
import { blackA } from "@radix-ui/colors";
import React from "react";

import { roundArrow } from "tippy.js";
import {
  BoldIconBold,
  H1IconBold,
  H2IconBold,
  ItalicIconBold,
  QuoteIconBold,
} from "../../../icons/icons";

const switchBlockQuote = editor => {
  // editor.chain().focus().updateAttributes('blockquote',{ class: 'wp-block-quote' }).run();

  if (
    editor.isActive("blockquote") &&
    !editor.isActive({ class: "wp-block-quote" })
  ) {
    if(editor.isActive('heading')){
      editor.chain().focus().toggleNode('heading', 'paragraph').updateAttributes("blockquote", { class: "wp-block-quote" }).run()
    }else{
      editor
        .chain()
        .focus()
        .updateAttributes("blockquote", { class: "wp-block-quote" })
        .run();
    }
  } else {
    if(editor.isActive('heading')){
      editor.chain().focus().toggleNode('heading', 'paragraph').toggleBlockquote().run()
    }else{
      editor.chain().focus().toggleBlockquote().run();
    }
    
  }
};

const IconButton = styled("button", {
  // all: 'unset',
  fontFamily: "inherit",
  borderRadius: "6px",
  height: 28,
  width: 35,
  display: "inline-flex",
  marginRight: 1,
  marginLeft: 1,
  alignItems: "center",
  justifyContent: "center",
  // color: slate.slate6,
  // backgroundColor: 'transparent',
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
  // '&:hover': { backgroundColor: slate.slate11 },
  "&:focus": { boxShadow: `0 0 0 2px black` },
  //   '&:active':{background:'white'}
});

const MenuBar = ({ editor, isSelecting, theme }) => {
  if (!editor) {
    return null;
  }

  const activeColor = theme === "blue" ? "text-blue-400" : "text-green-400/90";
  // console.log(editor);
  return (
    <>
      <BubbleMenu
        style={{ pointerEvents: "none" }}
        pluginKey={"TextMenu"}
        tippyOptions={{
          arrow: roundArrow,
          popperOptions: {
            modifiers: [{ name: "eventListeners", options: { scroll: false } }],
          },
          duration: 100,
          animation: "scale-subtle",
        }}
        shouldShow={({ editor, view, state, oldState, from, to }) => {
          const selection = editor.state.selection;
          const isTextSelection = selection instanceof TextSelection;

          if (
            isTextSelection &&
            selection.ranges[0].$from.pos == selection.ranges[0].$to.pos
          ) {
            return false;
          }

          if (isTextSelection) {
            return (
              editor.isActive("paragraph") ||
              editor.isActive("heading") ||
              editor.isActive("figcaption") ||
              editor.isActive("image")
            );
            //  )
          } else {
            return false;
          }
        }}
        element={document.getElementById("editor-container")}
        editor={editor}
      >
        {/* bold */}
        <div
          className={`${
            isSelecting ? "" : "pointer-events-all"
          } p-2 duration-300 rounded-md shadow-md bg-gray-900 flex text-gray-100`}
        >
          <div
            className={`${
              isSelecting ? "pointer-events-none" : "pointer-events-all"
            } flex`}
          >
            <IconButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`
                hover:bg-gray-800  mr-1 my-auto
                ${editor.isActive("bold") ? "bg-gray-800" : "bg-gray-900"}
                ${editor.isActive("bold") ? activeColor : "text-gray-200"}`}
            >
              <BoldIconBold size={22} />
            </IconButton>
            {/* italic */}
            <IconButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`hover:bg-gray-800  mr-1 my-auto
                ${editor.isActive("italic") ? "bg-gray-800" : "bg-gray-900"}
                ${editor.isActive("italic") ? activeColor : "text-gray-200"}`}
            >
              <ItalicIconBold size={22} />
            </IconButton>

            <LinkInput
              marginLeft={editor.isActive("figure") && -52}
              showRemove={true}
              editor={editor}
            />

            {/* underline */}
            {/* <IconButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`hover:bg-gray-800  mr-1
                ${editor.isActive("underline")?'bg-gray-800':'bg-gray-900'}
                ${editor.isActive("underline")?activeColor:'text-gray-200'}`}
              >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 3v9a4 4 0 1 0 8 0V3h2v9a6 6 0 1 1-12 0V3h2zM4 20h16v2H4v-2z" fill="currentColor"/></svg>
              </IconButton> */}
            {/* headings */}
            {!editor.isActive("figure") && (
              <>
                <div
                  className="bg-gray-700 hover:bg-gray-900 mx-1 my-auto"
                  style={{ height: "20px", width: "1px" }}
                />

                <IconButton
                  onClick={() => {
                    if (editor.isActive("blockquote")) {
                      editor
                        .chain()
                        .focus()
                        .toggleBlockquote()
                        .toggleHeading({ level: 1 })
                        .run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                    }
                  }}
                  className={`hover:bg-gray-800  mr-1 my-auto
                ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-gray-800"
                    : "bg-gray-900"
                }
                ${
                  editor.isActive("heading", { level: 1 })
                    ? activeColor
                    : "text-gray-200"
                }`}
                >
                  <H1IconBold size={22} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    if (editor.isActive("blockquote")) {
                      editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: 2 })
                        .toggleBlockquote()
                        .run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }
                  }}
                  className={`hover:bg-gray-800  mr-1 my-auto
                ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-gray-800"
                    : "bg-gray-900"
                }
                ${
                  editor.isActive("heading", { level: 2 })
                    ? activeColor
                    : "text-gray-200"
                }`}
                >
                  <H2IconBold size={22} />
                </IconButton>
              </>
            )}
            {/* blockquote */}
            {!editor.isActive("figure") && (
              <>
                <div
                  className="bg-gray-700 hover:bg-gray-900 mx-1 my-auto"
                  style={{ height: "20px", width: "1px" }}
                />
                <IconButton
                  onClick={() => switchBlockQuote(editor)}
                  className={`hover:bg-gray-800  mr-1 my-auto
                ${editor.isActive("blockquote") ? "bg-gray-800" : "bg-gray-900"}
                ${
                  editor.isActive("blockquote") ? activeColor : "text-gray-200"
                }`}
                >
                  <QuoteIconBold size={22} />
                </IconButton>
              </>
            )}

            {/* Ordered list */}
            {/* {!editor.isActive('figure') && 
              <IconButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`hover:bg-gray-800  mr-1
                ${editor.isActive("bulletList")?'bg-gray-800':'bg-gray-900'}
                ${editor.isActive("bulletList")?activeColor:'text-gray-200'}`}
              >
             <svg className="h-5 w-5"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" fill="currentColor"/></svg>
              </IconButton>} */}
            {/* unordered list */}
            {/* {!editor.isActive('figure') &&
              <>
              <IconButton
              className={`hover:bg-gray-800  mr-1
              ${editor.isActive("orderedList")?'bg-gray-800':'bg-gray-900'}
                ${editor.isActive("orderedList")?activeColor:'text-gray-200'}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" fill="currentColor"/></svg>
              </IconButton>
              <div className="bg-gray-700 hover:bg-gray-900 mx-1 my-auto" style={{height:'20px',marginRight:1, width:'1px'}}/>
              </>
              } */}
          </div>
        </div>
      </BubbleMenu>
    </>
  );
};

export default MenuBar;
