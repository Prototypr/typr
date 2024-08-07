"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";

import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";

import Editor from "./Editor";
import Spinner from "./atom/Spinner/Spinner.js";

import useLoad from "./editorHooks/useLoad";
import useCreate from "./editorHooks/useCreate";
import useUpdate from "./editorHooks/useUpdate";

import EditorNav from "./EditorNav";
import Toast from "./toast/Toast";
import { useConfirmTabClose } from "./useConfirmTabClose";
import { debounce } from "lodash";

import { customDeepMerge } from "./utils/customDeepMerge";

import { defaultProps } from "./config/defaultProps";

export const PostStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'publish',
  // Add more default statuses as needed
};

const saveDebounceDelay = 3000;

/**
 * Write
 * used to create new post
 *
 * this hook loads the editor with any content stored in local storage
 *
 * @returns
 */
export default function EditorWrapper(props) {
  const mergedProps = React.useMemo(() => {
    try {
      return customDeepMerge(defaultProps, props);
    } catch (error) {
      console.error("Error merging props:", error);
      return { ...defaultProps, ...props };
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
    children,
    childProps,

    requireLogin,
    enablePublishingFlow,
    customPostStatuses,
    
    tool,
    isInterview,
  } = mergedProps;

   // Merge default and custom post statuses
   const POST_STATUSES = React.useMemo(() => ({
    ...PostStatus,
    ...(customPostStatuses || {}),
  }), [customPostStatuses]);

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
  //create new post hook
  const { createPost, creatingPost, created } = useCreate({enablePublishingFlow, POST_STATUSES});

  
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
    POST_STATUSES
  });

  useConfirmTabClose(hasUnsavedChanges);

  /**
   * updatePost
   * when editor onUpdate is triggered,
   * save the content to local storage
   * @param {*} param0
   */
  const updatePost = ({ editor, json, forReview }) => {
    // send the content to an API here (if new post only)
    if (postId) {
      setHasUnsavedChanges(true);
      if (enablePublishingFlow) {
        setTimeout(() => {
          setSaving(!saving);
        }, 2700);
        debounceSave({ editor, forReview });
      } else if (enablePublishingFlow == false) {
        //delete the local storage
        localStorage.removeItem("wipContent");
        //save the new version
        localStorage.setItem("wipContent_" + postId, JSON.stringify(json));
      }
    } else {
      localStorage.setItem("wipContent", JSON.stringify(json));
    }
  };

  /**
   * bypass debounce and save immediately
   * @param {*} param0
   */
  const forceSave = ({ editor, json, forReview, publish, unpublish }) => {
    setSaving(false);
    _savePost({ editor, forReview, forced: true, publish, unpublish });
  };

  /**
   * for autosave
   */
  const debounceSave = useCallback(
    debounce(async ({ editor, forReview }) => {
      setSaving(false);
      _savePost({ editor, forReview });
    }, saveDebounceDelay),
    [user, postId, postObject, postStatus, routerPostId]
  );

  const postIdRef = useRef(postId);
  const routerPostIdRef = useRef(routerPostId);

  useEffect(() => {
    postIdRef.current = postId;
    routerPostIdRef.current = routerPostId;
  }, [postId, routerPostId]);

  const userRef = useRef(user);
  const postStatusRef = useRef(postStatus);
  const postObjectRef = useRef(postObject);
  const createPostRef = useRef(createPost);
  const refetchRef = useRef(refetch);
  const onPostCreatedRef = useRef(hooks.onPostCreated);
  const updatePostByIdRef = useRef(updatePostById);
  const savePostRef = useRef(postOperations.save);
  const createPostOperationRef = useRef(postOperations.create);
  const enablePublishingFlowRef = useRef(enablePublishingFlow);

  useEffect(() => {
    userRef.current = user;
    postStatusRef.current = postStatus;
    postObjectRef.current = postObject;
    createPost.current = createPost;
    refetchRef.current = refetch;
    onPostCreatedRef.current = hooks.onPostCreated;
    updatePostByIdRef.current = updatePostById;
    savePostRef.current = postOperations.save;
    createPostOperationRef.current = postOperations.create;
    enablePublishingFlowRef.current = enablePublishingFlow;
  }, [
    user,
    postStatus,
    postObject,
    createPost,
    refetch,
    hooks.onPostCreated,
    updatePostById,
    postOperations.save,
    postOperations.create,
    enablePublishingFlow,
  ]);

  /**
   * when the post object loads,
   * set the fields in the settings menu
   */
  useEffect(() => {
    if (postObject) {
      const getNestedValue = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
      };

      const updateSettingsArray = array =>
        array.map(option => ({
          ...option,
          initialValue: option.field
            ? getNestedValue(postObject, option.field) ?? option.initialValue
            : option.initialValue,
        }));

      setSettingsOptions({
        general: updateSettingsArray(settingsOptions.general),
        seo: updateSettingsArray(settingsOptions.seo),
      });
    }
  }, [postObject]);

  /**
   * _savePost
   * when save button is clicked
   * save the post to the backend
   *
   * for new post, create a new post and redirect to the new post
   * @param {*} param0
   * @returns
   */
  const _savePost = useCallback(async ({ editor, forReview , forced, publish, unpublish}) => {
    const currentPostId = postIdRef.current;
    const currentRouterPostId = routerPostIdRef.current;

    //check if editor has any content
    if (
      editor.state.doc.textContent.trim() === "" &&
      editor.state.doc.childCount <= 2
    ) {
      return false;
    }

    try {
      //if publishFlow is not enabled, save to local storage
      if (enablePublishingFlowRef.current === false) {
        if(currentPostId){
          //clear the none id version
          localStorage.removeItem("wipContent");
          //save the new version
          localStorage.setItem(
            "wipContent_" + currentPostId,
            JSON.stringify(editor.state.doc.toJSON())
          );
        }else{
          localStorage.setItem(
            "wipContent",
            JSON.stringify(editor.state.doc.toJSON())
          );
        }

        if((forced && (!publish && !unpublish)) && !currentPostId){
          //create a new post
          const postInfo = await createPostRef.current({
            user: userRef.current,
            editor,
            createPostOperation: createPostOperationRef.current,
            enablePublishingFlow: enablePublishingFlowRef.current,
          });
          // Set the new slug
          
          if (postInfo?.id) {
            setPostId(postInfo?.id);
            onPostCreatedRef.current({ id: postInfo?.id, postInfo });
          }
          localStorage.removeItem("wipContent");
          
          refetchRef.current();
          return true;
        } else if (forced && currentPostId) {
          // update the post
          const updatedPostObject = await updatePostByIdRef.current({
            editor: editor,
            postId: currentPostId,
            user: userRef.current,
            forReview: forReview,
            forced: forced,
            publish: publish,
            unpublish: unpublish,
            postStatus: postStatusRef.current,
            postObject: postObjectRef.current,
            enablePublishingFlow: enablePublishingFlowRef.current,
          });
          if (updatedPostObject?.id) {
            setPostObject(updatedPostObject);
            // Confirm no unsaved changes
            setHasUnsavedChanges(false);
          }
        }

        return true;
      } 
      else if (currentPostId) {
        // Updating an existing post
        const updatedPostObject = await updatePostByIdRef.current({
          editor: editor,
          postId: currentPostId,
          user: userRef.current,
          forReview: forReview,
          postStatus: postStatusRef.current,
          postObject: postObjectRef.current,
          enablePublishingFlow: enablePublishingFlowRef.current,
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
        if (
          !currentRouterPostId &&
          typeof createPostOperationRef.current === "function"
        ) {
          //check if post content is empty
          if (editor.state.doc.textContent.trim() === "") {
            return false;
          }

          const postInfo = await createPostRef.current({
            user: userRef.current,
            editor,
            createPostOperation: createPostOperationRef.current,
            enablePublishingFlow: enablePublishingFlowRef.current,
          });
          // Set the new slug
          localStorage.removeItem("wipContent");

          if (postInfo?.id) {
            setPostId(postInfo?.id);
            onPostCreatedRef.current({ id: postInfo?.id, postInfo });
          }

          refetchRef.current();
          return true;
        }
        if (!currentRouterPostId && typeof savePostRef.current !== "function") {
          return false;
        } else {
          return false;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }, []);

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
          post={postObject}
          postStatus={postStatus}
          enablePublishingFlow={enablePublishingFlow}
          hasUnsavedChanges={hasUnsavedChanges}
          user={user}
          mutateUser={user.mutate}
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
          isInterview ? "h-screen overflow-y-auto" : "h-full"
        }`}
        id="editor-container"
      >
        <div className="w-full h-full mx-auto  relative">
          {/* {!user && <Fallback />} */}

          {/* only load editor if initialContent is not null */}
          {(requireLogin == true && !user?.isLoggedIn) ||
          initialContent == null ? (
            // <Layout>
            <div className="my-auto h-screen flex flex-col justify-center text-center">
              <div className="mx-auto opacity-50">
                <Spinner />
              </div>
              {/* <h2>You need to be logged in.</h2> */}
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
