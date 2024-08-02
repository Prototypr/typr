"use client";

import React, { useCallback, useEffect } from "react";

import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";

import Editor from "./Editor";
import Spinner from "./atom/Spinner/Spinner.js";

import useLoad from "./editorHooks/useLoad";
import useCreate from "./editorHooks/useCreate";
import useUpdate from "./editorHooks/useUpdate";

import EditorNav from "./EditorNav";
import { useConfirmTabClose } from "./useConfirmTabClose";
import { debounce } from "lodash";


// Rest of your component code
const saveDebounceDelay = 3000;

/**
 * Write
 * used to create new post
 *
 * this hook loads the editor with any content stored in local storage
 *
 * @returns
 */
export default function EditorWrapper({
  isInterview = false,
  tool = false,
  user,
  navLogo=null,
  navigate=(url)=>{
    if (typeof window !== 'undefined' && typeof url === 'string') {
      window.location.href = url;
    }
  },
  primaryColor="",
  mutateUser = false,
  isLoggedIn,

  //external api methods required
  loadPost,
  createPost,
  savePost,

  onPostCreated,

  //post slug for saving
  postId:routerPostId,

  children,
  childProps = {}, // Add this line to accept custom props
}) {
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
  } = useLoad({
    user,
    isLoggedIn,
    routerPostId,
    interview: isInterview,
    productName: tool?.name ? tool.name : false,
    // @todo make this api stuff work for everyone
    //api calls
    getUserArticle:loadPost
  });
  //create new post hook
  const { createPost:createPostFromHook, creatingPost, created } = useCreate();

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
  } = useUpdate({savePost});

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
      setTimeout(() => {
        setSaving(!saving);
      }, 2700);
      debounceSave({ editor, forReview });
    } else {
      localStorage.setItem("wipContent", JSON.stringify(json));
      debounceSave({ editor, forReview });
    }
  };

  /**
   * bypass debounce and save immediately
   * @param {*} param0
   */
  const forceSave = ({ editor, json, forReview }) => {
    setSaving(false);
    _savePost({ editor, forReview });
  };

  /**
   * for autosave
   */
  const debounceSave = useCallback(
    debounce(async ({ editor, forReview }) => {
      setSaving(false);
      _savePost({ editor, forReview });
    }, saveDebounceDelay),
    [user, postId, postObject, postStatus]
  );

  /**
   * _savePost
   * when save button is clicked
   * save the post to the backend
   *
   * for new post, create a new post and redirect to the new post
   * @param {*} param0
   * @returns
   */
  const _savePost = async ({ editor, forReview }) => {
    //check if editor has any content
    // Updating an existing post
    if (
      editor.state.doc.textContent.trim() === "" &&
      editor.state.doc.childCount <= 2
    ) {
      return false;
    }

    try {
      if (postId) {
        // Updating an existing post
        const updatedPostObject = await updatePostById({
          editor: editor,
          postId: postId,
          user: user,
          forReview: forReview,
          postStatus: postStatus,
          postObject: postObject,
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
        if (!routerPostId && typeof savePost === 'function') {
          const postInfo = await createPostFromHook({ user, editor, forReview, create: createPost });
          // Set the new slug
          localStorage.removeItem("wipContent");

          if(postInfo?.id){
            onPostCreated({id:postInfo?.id,postInfo})
          }

          refetch();
          return true;
        } 
        if(!routerPostId && typeof savePost !== 'function'){
          return false
        }
        else {
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

      if (updatedPostObject) {
        setPostObject(updatedPostObject);
      }

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  return (
    <>
      <EditorNav
        navigate={navigate}
        navLogo={navLogo}
        primaryColor={primaryColor}
        isInterview={isInterview}
        tool={tool}
        post={postObject}
        postStatus={postStatus}
        user={user}
        mutateUser={mutateUser}
      />

      <div
        className={`w-full ${isInterview ? "h-screen overflow-y-auto" : "h-full"}`}
        id="editor-container"
      >
        <div className="w-full h-full mx-auto  relative">
          {/* {!user && <Fallback />} */}

          {/* only load editor if initialContent is not null */}
          {(!isLoggedIn) || initialContent == null ? (
            // <Layout>
            <div className="my-auto h-screen flex flex-col justify-center text-center">
              <div className="mx-auto opacity-50">
                <Spinner />
              </div>
              {/* <h2>You need to be logged in.</h2> */}
            </div>
          ) : (
            // </Layout>
            (isLoggedIn) && (
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
                      updatePostSettings: user?.isAdmin
                        ? updatePostSettings
                        : false,
                      user,
                      primaryColor,
                      ...childProps, // Spread custom props to override defaults
                    })
                  ) : (
                    <Editor
                      canEdit={canEdit}
                      initialContent={initialContent}
                      postStatus={postStatus}
                      hasUnsavedChanges={hasUnsavedChanges}
                      isSaving={saving || creatingPost}
                      saved={saved || created}
                      slug={slug}
                      postId={postId}
                      postObject={postObject}
                      updatePost={updatePost}
                      forceSave={forceSave}
                      refetchPost={refetch}
                      primaryColor={primaryColor}
                      updatePostSettings={
                        user?.isAdmin ? updatePostSettings : false
                      }
                      user={user}
                    />
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}