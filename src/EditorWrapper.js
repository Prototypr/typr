"use client";

import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";

import Editor from "./Editor";
import Spinner from "./atom/Spinner/Spinner.js";

import useLoad from "./editorHooks/useLoad";
import useCreate from "./editorHooks/useCreate";
import useUpdate from "./editorHooks/useUpdate";

import EditorNav from "./EditorNav";
import Toast from "./toast/Toast";
import { useConfirmTabClose } from "./useConfirmTabClose";
// import { debounce } from "lodash";

import { customDeepMerge } from "./utils/customDeepMerge";

import { defaultProps } from "./config/defaultProps";

export const PostStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "publish",
  // Add more default statuses as needed
};

const saveDebounceDelay = 2700;

/**
 * Write
 * used to create new post
 *
 * this hook loads the editor with any content stored in local storage
 *
 * @returns
 */
export default function EditorWrapper(props) {
  const { children, ...restProps } = props;

  const mergedProps = React.useMemo(() => {
    try {
      return customDeepMerge(defaultProps, restProps);
    } catch (error) {
      console.error("Error merging props:", error);
      return { ...defaultProps, ...restProps };
    }
  }, [props]);

  const {
    theme,
    components,
    user,
    postId: routerPostId,
    postOperations,
    hooks,
    router,
    childProps,

    requireLogin,
    enablePublishingFlow,
    customPostStatuses,

    tool,
    isInterview,
  } = mergedProps;

  // Merge default and custom post statuses
  const POST_STATUSES = React.useMemo(
    () => ({
      ...PostStatus,
      ...(customPostStatuses || {}),
    }),
    [customPostStatuses]
  );

  //merge the settings menus so we can save them as a single object
  const [settingsOptions, setSettingsOptions] = useState({
    general: components?.settingsPanel?.generalTab?.menu || [],
    seo: components?.settingsPanel?.seoTab?.menu || [],
  });

  /**
   * embed twitter widget if not already loaded
   */
  useEffect(() => {
    addTwitterScript();
  }, []);

  //initialContent is null until loaded - so is 'false' when it's a new post
  //useLoad hook
  const {
    canEdit,
    initialContent,
    postStatus,
    postObject,
    slug,
    postId,
    refetch,
    setPostObject,
    setPostId,
  } = useLoad({
    user,
    routerPostId,
    requireLogin,
    interview: isInterview,
    productName: tool?.name ? tool.name : false,
    //api calls
    loadPostOperation: postOperations.load,
    enablePublishingFlow,
    POST_STATUSES,
  });

  useEffect(() => {
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const updateSettingsArray = (array) =>
      array.map((option) => ({
        ...option,
        initialValue:
          option.field && postObject?.id
            ? getNestedValue(postObject, option.field) ?? option.initialValue
            : option.initialValue,
      }));

    setSettingsOptions({
      general: updateSettingsArray(components?.settingsPanel?.generalTab?.menu || []),
      seo: updateSettingsArray(components?.settingsPanel?.seoTab?.menu || []),
    });
  }, [components?.settingsPanel, postObject]);

  //create new post hook
  const { createPost, creatingPost, created } = useCreate({
    enablePublishingFlow,
    POST_STATUSES,
  });


  const {
    //update post content
    updatePostById,
    //update post settings
    updateSettings,
    setHasUnsavedChanges,
    saved,
    saving,
    setSaving,
    hasUnsavedChanges,
  } = useUpdate({
    savePostOperation: postOperations.save,
    enablePublishingFlow,
    POST_STATUSES,
  });

  useConfirmTabClose(hasUnsavedChanges);

  const debouncedSave = useDebouncedCallback(async ({ editor, forReview }) => {
    setSaving(false);
    await _savePost({ editor, forReview });
  }, saveDebounceDelay);

  /**
   * updatePost
   * when editor onUpdate is triggered,
   * save the content to local storage
   * @param {*} param0
   */
  const updatePost = ({ editor, json, forReview, publishFlowEnabled }) => {
    // send the content to an API here (if new post only)
    if (postId) {
      setHasUnsavedChanges(true);
      if (publishFlowEnabled) {
        setTimeout(() => {
          setSaving(!saving);
        }, 2700);
        debouncedSave({ editor, forReview });
      } else if (publishFlowEnabled == false) {
        //delete the local storage
        localStorage.removeItem("wipContent");
        //save the new version
        localStorage.setItem("wipContent_" + postId, JSON.stringify(json));
      }
    } else {
      if (publishFlowEnabled) {
        localStorage.setItem("wipContent", JSON.stringify(json));
        setTimeout(() => {
          if(!editor.state.doc.textContent.trim() === ""){
            setSaving(!saving);
          }
        }, 2700);
        debouncedSave({ editor, forReview });
      } else {
        setHasUnsavedChanges(true);
        localStorage.setItem("wipContent", JSON.stringify(json));
      }
    }
  };

  /**
   * bypass debounce and save immediately
   * @param {*} param0
   */
  const forceSave = ({ editor, json, forReview, publish, unpublish }) => {
    setSaving(false);
    if (publish !== undefined || unpublish !== undefined) {
      _savePost({ editor, forReview, forced: true, publish, unpublish });
    } else {
      _savePost({ editor, forReview, forced: true });
    }
  };

  const _savePost = async ({
    editor,
    forReview,
    forced,
    publish,
    unpublish,
  }) => {
    //check if editor has any content
    if (
      editor.state.doc.textContent.trim() === "" &&
      editor.state.doc.childCount <= 2
    ) {
      return false;
    }

    try {
      //if publishFlow is not enabled, save to local storage
      if (enablePublishingFlow === false) {
        if (postId) {
          //clear the none id version
          localStorage.removeItem("wipContent");
          //save the new version
          localStorage.setItem(
            "wipContent_" + postId,
            JSON.stringify(editor.state.doc.toJSON())
          );
        } else {
          localStorage.setItem(
            "wipContent",
            JSON.stringify(editor.state.doc.toJSON())
          );
        }

        if (forced && !publish && !unpublish && !postId) {
          //create a new post
          const postInfo = await createPost({
            user,
            editor,
            createPostOperation: postOperations.create,
          });
          // Set the new slug

          if (postInfo?.id) {
            setPostId(postInfo?.id);
            hooks.onPostCreated({ id: postInfo?.id, postInfo });
          }
          localStorage.removeItem("wipContent");

          refetch();
          return true;
        } else if (forced && postId) {
          // update the post
          const updatedPostObject = await updatePostById({
            editor: editor,
            postId: postId,
            user: user,
            forReview: forReview,
            forced: forced,
            publish: publish,
            unpublish: unpublish,
            postStatus: postStatus,
            postObject: postObject,
            enablePublishingFlow: enablePublishingFlow,
          });
          if (updatedPostObject?.id) {
            setPostObject(updatedPostObject);
            // Confirm no unsaved changes
            setHasUnsavedChanges(false);
          }
        }

        return true;
      } else if (postId) {
        // Updating an existing post
        const updatedPostObject = await updatePostById({
          editor: editor,
          postId: postId,
          user: user,
          forReview: forReview,
          postStatus: postStatus,
          postObject: postObject,
          enablePublishingFlow: enablePublishingFlow,
        });

        // Update the postObject from useLoad hook
        if (updatedPostObject) {
          setPostObject(updatedPostObject);
          // Confirm no unsaved changes
          setHasUnsavedChanges(false);
        }
        return true;
      } else {
        // Creating a new post
        if (!routerPostId && typeof postOperations.create === "function") {
          //check if post content is empty
          if (editor.state.doc.textContent.trim() === "") {
            return false;
          }

          const postInfo = await createPost({
            user: user,
            editor,
            createPostOperation: postOperations.create,
            enablePublishingFlow: enablePublishingFlow,
          });
          // Set the new slug
          localStorage.removeItem("wipContent");

          if (postInfo?.id) {
            setPostId(postInfo?.id);
            hooks.onPostCreated({ id: postInfo?.id, postInfo });
          }

          refetch();
          return true;
        }
        if (!routerPostId && typeof postOperations.save !== "function") {
          return false;
        } else {
          return false;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  /**
   * updateSettings
   */
  const updatePostSettings = async ({ settings }) => {
    try {
      const updatedPostObject = await updateSettings({
        postId: postId,
        user: user,
        settings: settings,
        postObject: postObject,
      });

      if (updatedPostObject?.id) {
        setPostObject(updatedPostObject);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  };

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
          ) : initialContent == null ? (
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
                <div className="my-4">
                  {React.isValidElement(children) ? (
                    React.cloneElement(children, {
                      canEdit,
                      initialContent,
                      postStatus,
                      hasUnsavedChanges,
                      isSaving: saving || creatingPost,
                      saved: saved || created,
                      slug,
                      postId,
                      postObject,
                      toolContext: tool,
                      updatePost,
                      forceSave,
                      refetchPost: refetch,
                      settingsPanelSettings: components.settingsPanel,
                      settingsOptions,
                      user,
                      theme,
                      navSettings:components.nav,
                      enablePublishingFlow,
                      POST_STATUSES,
                      ...childProps, // Spread custom props to override defaults
                    })
                  ) : (
                    <Editor
                      canEdit={canEdit}
                      initialContent={initialContent}
                      hasUnsavedChanges={hasUnsavedChanges}
                      isSaving={saving || creatingPost}
                      saved={saved || created}
                      slug={slug}
                      postId={postId}
                      postObject={postObject}
                      updatePost={updatePost}
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