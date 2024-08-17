"use client"
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { useEditor, EditorContent } from "@tiptap/react";
import MenuFloating from "./Menus/FloatingMenu";

import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import TextMenu from "./Menus/TextMenu";
import ImageMenu from "./Menus/ImageMenu";

import Link from "@tiptap/extension-link";

import { CustomLink } from "./components/CustomLink";

import Cite from "./CustomExtensions/Cite";

import Iframe from "./CustomExtensions/Iframe/Iframe";
import Gapcursor from "@tiptap/extension-gapcursor";
import Youtube from "@tiptap/extension-youtube";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import CodeBlock from "@tiptap/extension-code-block";
import Bold from "@tiptap/extension-bold";
import HardBreak from "@tiptap/extension-hard-break";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Dropcursor from "@tiptap/extension-dropcursor";
import History from "@tiptap/extension-history";
import { Blockquote } from "./CustomExtensions/CustomBlockquote";
import { Image } from "./CustomExtensions/Figure2/CustomImage";

import Figure from "./CustomExtensions/Figure2/Figure";
import FigCaption from "./CustomExtensions/Figure2/Figcaption";
import { PasteFilter } from "./CustomExtensions/PasteFilter";

import Tweet from "./CustomExtensions/Tweet/Tweet";
import LinkEmbed from "./CustomExtensions/LinkEmbed/LinkEmbed";
import Video from "./CustomExtensions/Video/Video";

import VideoMenu from "./Menus/VideoMenu";
import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";
import UndoRedoButtons from "./UndoRedoButtons";
import EditorNavButtons from "./EditorNavButtons";

const Editor = ({
  wrapperClass = false,
  postType = "article",
  canEdit = false,
  initialContent = null,
  postObject = null,
  showNavButtons = true,
  //save status
  isSaving = false,
  hasUnsavedChanges = false,
  saved = false,
  //functions
  refetchPost = false,
  updatePost = false,
  forceSave = false,
  mediaHandler = false,
  updatePostSettings = false,
  setInitialEditorContent = false,
  settingsPanelSettings,
  settingsOptions,
  theme,
  user,
  enablePublishingFlow,
  navSettings,
  POST_STATUSES,
  postId, // Add postId as a prop
}) => {
  // const { user } = useUser({
  //   redirectIfFound: false,
  // });

  const isFirstMount = useRef(true);

  const [saveForReview, setForReview] = useState(false);
  const [shouldUpdateContent, setShouldUpdateContent] = useState(false);

  useEffect(() => {
    //if forceSave is a function
    if (forceSave!==false && saveForReview==true) {
      forceSave({ editor, json: editor.getJSON(), forReview: saveForReview });
      setForReview(false);
    }
  }, [saveForReview]);

  const enablePublishingFlowRef = useRef(enablePublishingFlow);

  useEffect(() => {
    enablePublishingFlowRef.current = enablePublishingFlow;
  }, [enablePublishingFlow]);

  const editor = useEditor({
    extensions: [
      // CustomDocument,
      //if postType is article, then the document should start with a heading
      Document.extend({
        content: postType == "article" ? "heading block*" : "block*",
        atom: true,
      }),
      Text,
      History,
      Paragraph,
      Heading,
      Tweet,
      CodeBlock,
      HorizontalRule,
      Bold,
      HardBreak,
      Underline,
      Italic,
      ListItem,
      Gapcursor,
      BulletList,
      OrderedList,
      Dropcursor,
      Cite,
      Video,
      Iframe,
      Youtube,
      Blockquote,
      LinkEmbed,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: null,
          class: null,
        },
      }),

      // images are converted to figures now
      Figure,
      Image.configure({
        allowBase64: true,
      }),
      FigCaption,
      PasteFilter,
      // Figure.configure({
      //   allowBase64: true,
      // }),
      Placeholder.configure({
        showOnlyCurrent: false,
        includeChildren: false,
        placeholder: ({ editor, node }) => {
          if (node.type.name === "heading") {
            return "Title";
          }
          if (node.type.name === "figcaption") {
            return "Enter a caption";
          }
          if (node.type.name === "figure") {
            return "Enter a caption";
          }
          if (node.type.name === "tweet") {
            return "Paste a tweet link and press enter";
          }
          if (node.type.name == "paragraph") {
            //check if editor has 3 or more nodes
            if (
              editor.state.doc.textContent.trim() === "" &&
              editor.state.doc.childCount <= 2
            ) {
              return "Tell your story...";
            }
          }
        },
      }),
    ],
    onCreate: ({ editor }) => {
      
      console.log("--");
      if (!isFirstMount.current) {
        return;
      }
      isFirstMount.current = false;
      

      if (initialContent) {
        editor
          .chain()
          .setContent(initialContent)
          .setMeta("addToHistory", false)
          .run();
      } else {
        editor.commands.clearContent();
      }

      if (editor.state.doc.textContent.trim() === "") {
        setTimeout(() => {
          const json = editor.getJSON();

          if (json.content?.length > 0) {
            const paragraphCount = json.content.filter(
              node => node.type === "paragraph"
            ).length;

            if (paragraphCount == 0) {
              editor.chain().focus().setTextSelection(0).enter().run();
            }
          }
        }, 100);
      }

      if (setInitialEditorContent) setInitialEditorContent(editor);

      addTwitterScript();
    },
    onUpdate: ({ editor }) => {
      try {
        const json = editor.getJSON();
        // autosave would happen in the parent here;
        // if(shouldUpdateContent){
          updatePost({ 
            editor, 
            json, 
            forReview: saveForReview, 
            publishFlowEnabled: enablePublishingFlowRef.current 
          });
        // }
      } catch (e) {
        if (typeof updatePost !== "function") {
          console.log(e);
          console.log("updatePost is not a function");
        } else {console.log(e)};
      }
    },
  });

  useEffect(() => {
    setShouldUpdateContent(true);
  }, [initialContent]);

  useEffect(() => {
    if ( editor && shouldUpdateContent) {
      // setShouldUpdateContent(false); // Reset the flag after updating content
        setTimeout(() => {
        if (initialContent) {
          if (editor.getHTML() !== initialContent) {
            editor.chain().setContent(initialContent).run();
          }
        } else if (postId === null || postId === false || postId === undefined) {
          editor.chain().clearContent().run();
          setTimeout(() => {
            const json = editor.getJSON();
  
            if (json.content?.length > 0) {
              // Count the number of paragraphs
              const paragraphCount = json.content.filter(
                node => node.type === "paragraph"
              ).length;
              if (paragraphCount == 0) {
                editor.chain().focus().setTextSelection(0).enter().run();
              }
            }
          }, 10);
        }
      }, 20);
    }
  }, [initialContent]);


  if (!canEdit) {
    return (
      <div className="h-full w-full mx-auto  relative">
        <div className="my-auto h-screen flex flex-col justify-center text-center text-center">
          <img
            className="w-[160px] -mt-10 mx-auto"
            src="https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/ecacc329595d009d506f6ec3e6e47d0f.png"
          />
          <p className="text-gray-700">You are not owner of this post</p>

          <div className="mx-auto mt-4">
            <CustomLink href="/dashboard">
              <button
                className={`px-3 h-[35px] ${
                  theme == "blue"
                    ? "bg-blue-500 text-white font-semibold text-sm rounded-md w-fit hover:bg-blue-600"
                    : "bg-gray-500 text-white font-semibold text-sm rounded-md w-fit hover:bg-gray-600"
                }`}
              >
                Go to dashboard
              </button>
            </CustomLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full relative ${postType == "article" ? "my-4" : ""}`}>
        {/* NAVIGATION, WITH BUTTONS EMBEDDED AS A PROP */}
        {/* {user?.isAdmin && postType == "article" ? (
          <div className="mt-16 hidden sm:block">
            <div className="fixed bottom-3 z-20 w-full">
              <div className="relative bg-gray-100/80 w-[500px] shadow-sm border border-gray-300/20 mx-auto rounded-xl p-3 text-sm backdrop-blur text-gray-800 flex flex-row justify-center items-center">
                You're editing as admin.
              </div>
            </div>
          </div>
        ) : null} */}

        {/* undoredo buttons render in a portal on the navbar */}
        {showNavButtons !== false ? (
          <UndoRedoNavPortal>
            <div className="flex h-full">
              <UndoRedoButtons show={navSettings.undoRedoButtons.show} editor={editor} />
              {enablePublishingFlow !== false && (
                <div className={`ml-3 my-auto text-gray-500`}>
                  {isSaving
                    ? "Saving..."
                    : hasUnsavedChanges
                    ? ""
                    : saved
                    ? "Saved"
                    : ""}
                </div>
              )}
            </div>
          </UndoRedoNavPortal>
        ) : null}

        {showNavButtons !== false ? (
          <EditorButtonsNavPortal>
            <div className="flex justify-end w-full sm:w-fit sm:justify-end">
              <EditorNavButtons
                theme={theme}
                user={user}
                onSave={({ forReview }) => {
                  setForReview(forReview);
                }}
                isSaving={isSaving}
                saved={saved}
                canEdit={canEdit}
                editor={editor}
                //for settings panel
                postObject={postObject}
                updatePostSettings={updatePostSettings}
                refetchPost={refetchPost}
                settingsPanelSettings={settingsPanelSettings}
                settingsOptions={settingsOptions}
                enablePublishingFlow={enablePublishingFlow}
                forceSave={forceSave}
                POST_STATUSES={POST_STATUSES}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          </EditorButtonsNavPortal>
        ) : null}

        {/* NAVIGATION END */}
        <div
          className={
            wrapperClass
              ? wrapperClass
              : postType == "article"
              ? `my-4 pt-0 mt-[100px] max-w-[44rem] mx-auto relative pb-10 blog-content px-3 sm:px-0`
              : ""
          }
        >
          {editor && <MenuFloating editor={editor} user={user} theme={theme} mediaHandler={mediaHandler} />}
          <TextMenu editor={editor} theme={theme} />
          {/* <LinkMenu editor={editor} /> */}
          <ImageMenu editor={editor} theme={theme} />
          <VideoMenu editor={editor} theme={theme} />

          <EditorContent editor={editor} />
          <div className="popup-modal mb-6 relative bg-white p-6 pt-3 rounded-lg w-full"></div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};

export default Editor;

/**
 * Use portal components so that the buttons can be rendered on the navbar
 */
const EditorButtonsNavPortal = ({ children }) => {
  const container = document.getElementById("editor-nav-buttons");
  if (container) {
    return ReactDOM.createPortal(children, container);
  }
};

const UndoRedoNavPortal = ({ children }) => {
  const container = document.getElementById("undoredo-container");
  if (container) {
    return ReactDOM.createPortal(children, container);
  }
};