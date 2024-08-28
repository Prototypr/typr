"use client";

import React from "react";

import Editor from "./Editor/Editor";
import Spinner from "./atom/Spinner/Spinner.js";
import EditorNav from "./EditorNav";
import Toast from "./toast/Toast";
/**
 * Write
 * used to create new post
 *
 * this hook loads the editor with any content stored in local storage
 *
 * @returns
 */
export default function EditorWrapper(props) {
  const { children } = props;

  const {
    theme,
    components,
    user,
    mediaHandler,
    router,
    canEdit,
    childProps,
    mergedProps,
    requireLogin,
    enablePublishingFlow,
    editorWidth,
    postObject,
    hasUnsavedChanges,
    postStatus,
    tool,
    isInterview,
    extensions,
    editorSettings,
    _onEditorReady,
    POST_STATUSES,
    settingsOptions,
    updatePostSettings,
    contentReady,
    initialContent,
    slug,
    postId,
    saved,
    created,
    saving,
    creatingPost,
    unpublishedChanges,
    forceSave,
    refetch,
    updatePost,
  } = props.typr;

 

  return (
    <>
      {components.nav.show && (
        <EditorNav
          router={router}
          isInterview={isInterview}
          tool={tool}
          postObject={postObject}
          postStatus={postStatus}
          enablePublishingFlow={enablePublishingFlow}
          hasUnsavedChanges={hasUnsavedChanges}
          user={user}
          signOut={user.signOut}
          settings={{
            userBadge: components.nav.userBadge,
            nav: components.nav,
            autosave: mergedProps.autosave,
          }}
          theme={theme}
          POST_STATUSES={POST_STATUSES}
        />
      )}

      <div
        className={`w-full ${
          isInterview ? "h-screen overflow-y-auto" : "h-fit"
        }`}
        id="editor-container"
      >
        <div className="w-full h-full mx-auto  relative">
          {/* {!user && <Fallback />} */}

          {/* only load editor if initialContent is not null */}
          {requireLogin == true && !user?.isLoggedIn && !user?.loading ? (
            // <Layout>
            <div className="my-auto h-screen flex flex-col justify-center text-center">
              <h2 className="-mt-10">You need to be logged in.</h2>
            </div>
          ) : !contentReady || postId === -1 ? (
            <div className="my-auto h-screen flex flex-col justify-center text-center">
              <div className="mx-auto opacity-50">
                <Spinner />
              </div>
            </div>
          ) : (
            // </Layout>
            ((requireLogin == true && user?.isLoggedIn) ||
              requireLogin == false) && (
              <>
                <div className="mt-16 mb-3">
                  {React.isValidElement(children) ? (
                    React.cloneElement(children, {
                      maxWidth: editorWidth,
                      canEdit,
                      initialContent,
                      postStatus,
                      hasUnsavedChanges,
                      unpublishedChanges,
                      isSaving: saving || creatingPost,
                      saved: saved || created,
                      slug,
                      postId,
                      postObject,
                      toolContext: tool,
                      updatePost,
                      mediaHandler,
                      forceSave,
                      refetchPost: refetch,
                      updatePostSettings: components.settingsPanel?.show
                        ? updatePostSettings
                        : false,
                      settingsPanelSettings: components.settingsPanel,
                      settingsOptions,
                      user,
                      theme,
                      navSettings: components.nav,
                      enablePublishingFlow,
                      POST_STATUSES,
                      onEditorReady: _onEditorReady,
                      extensions,
                      editorSettings,
                      autosave: mergedProps.autosave,
                      router,
                      ...childProps, // Spread custom props to override defaults
                    })
                  ) : (
                    <Editor
                      onEditorReady={_onEditorReady}
                      maxWidth={editorWidth}
                      canEdit={canEdit}
                      initialContent={initialContent}
                      hasUnsavedChanges={hasUnsavedChanges}
                      unpublishedChanges={unpublishedChanges}
                      isSaving={saving || creatingPost}
                      saved={saved || created}
                      slug={slug}
                      postId={postId}
                      postObject={postObject}
                      updatePost={updatePost}
                      mediaHandler={mediaHandler}
                      forceSave={forceSave}
                      refetchPost={refetch}
                      updatePostSettings={
                        components.settingsPanel?.show
                          ? updatePostSettings
                          : false
                      }
                      settingsPanelSettings={components.settingsPanel}
                      settingsOptions={settingsOptions}
                      user={user}
                      theme={theme}
                      navSettings={components.nav}
                      enablePublishingFlow={enablePublishingFlow}
                      POST_STATUSES={POST_STATUSES}
                      extensions={extensions}
                      editorSettings={editorSettings}
                      autosave={mergedProps.autosave}
                      router={router}
                    />
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
      <Toast />
    </>
  );
}
