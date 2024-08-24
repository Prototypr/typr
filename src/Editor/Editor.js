"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { EditorContent } from "@tiptap/react";
import { useEditor } from "@tiptap/react";

import TextMenu from "./extensions/Menus/TextMenu";
import ImageMenu from "./extensions/Menus/ImageMenu";
import MenuFloating from "./extensions/Menus/FloatingMenu";
import VideoMenu from "./extensions/Menus/VideoMenu";

import { CustomLink } from "./components/CustomLink";
import { addTwitterScript } from "../editorHooks/libs/addTwitterScript";
import UndoRedoButtons from "./UI/UndoRedoButtons";
import EditorNavButtons from "./UI/EditorNavButtons";

import { extensions as defaultExtensions } from "./extensions/extensions";

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
  unpublishedChanges = false,
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
  maxWidth,
  onEditorReady,
  extensions,
  editorSettings,
  autosave,
}) => {
  // const { user } = useUser({
  //   redirectIfFound: false,
  // });

  const [saveForReview, setForReview] = useState(false);
  const [shouldUpdateContent, setShouldUpdateContent] = useState(false);

  useEffect(() => {
    //if forceSave is a function
    if (forceSave !== false && saveForReview == true) {
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
      ...defaultExtensions({ postType: postType }),
      ...(extensions || []), // Include extensions if provided, otherwise use an empty array
    ],
    onCreate: ({ editor }) => {
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

      if (onEditorReady) {
        onEditorReady({ editor });
      }
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
          publishFlowEnabled: enablePublishingFlowRef.current,
        });
        // }
      } catch (e) {
        if (typeof updatePost !== "function") {
          console.log(e);
          console.log("updatePost is not a function");
        } else {
          console.log(e);
        }
      }
    },
  });

  useEffect(() => {
    setShouldUpdateContent(true);
  }, [postObject?.id]);

  useEffect(() => {
    if (editor && shouldUpdateContent) {
      setShouldUpdateContent(false); // Reset the flag after updating content
      setTimeout(() => {
        if (initialContent) {
          if (editor.getHTML() !== initialContent) {
            editor.chain().setContent(initialContent).run();
          }
        } else if (
          postId === null ||
          postId === false ||
          postId === undefined
        ) {
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
              <UndoRedoButtons
                show={navSettings.undoRedoButtons.show}
                editor={editor}
              />
              {(enablePublishingFlow !== false || autosave == true) && (
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
                autosave={autosave}
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
                unpublishedChanges={unpublishedChanges}
              />
            </div>
          </EditorButtonsNavPortal>
        ) : null}

        {/* NAVIGATION END */}
        <div
          style={{
            maxWidth: maxWidth
              ? maxWidth
              : postType == "article"
              ? "44rem"
              : "44rem",
            margin: "0 auto",
          }}
          className={
            wrapperClass
              ? wrapperClass
              : postType == "article"
              ? `my-4 pt-0 mt-[100px]  mx-auto relative pb-10 blog-content px-3 sm:px-0`
              : ""
          }
        >
          {editor && editorSettings?.menus?.floatingMenu?.show && (
            <MenuFloating
              editor={editor}
              user={user}
              theme={theme}
              mediaHandler={mediaHandler}
            />
          )}
          <TextMenu editor={editor} theme={theme} />
          {/* <LinkMenu editor={editor} /> */}
          <ImageMenu editor={editor} theme={theme} />
          <VideoMenu editor={editor} theme={theme} />

          <EditorContent editor={editor} />
          <div className="popup-modal mb-6 relative  p-6 pt-3 rounded-lg w-full"></div>
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
