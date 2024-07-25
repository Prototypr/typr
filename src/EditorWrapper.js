import React from "react";

import dynamic from "next/dynamic";

import { useCallback, useEffect } from "react";
import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";

const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
});
const Spinner = dynamic(() => import("./atom/Spinner/Spinner"));

import useLoad from "./editorHooks/useLoad";
import useCreate from "./editorHooks/useCreate";
import useUpdate from "./editorHooks/useUpdate";

import { useRouter } from "next/router";
import EditorNav from "./EditorNav";
import { useConfirmTabClose } from "./useConfirmTabClose";
import { debounce } from "lodash";

import "../dist/styles.css";

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
  mutateUser,
  // @todo api stuff usable:
  getUserArticle,
  getSlugFromArticleId,
  children,
  childProps = {}, // Add this line to accept custom props
}) {
  const router = useRouter();

  // const { user } = useUser({
  //   // redirectTo: '/account',
  //   redirectTo: "/onboard",
  //   redirectIfFound: false,
  // });
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
    interview: isInterview,
    productName: tool?.name ? tool.name : false,
    // @todo make this api stuff work for everyone
    //api calls
    getUserArticle,
    getSlugFromArticleId,
  });
  //create new post hook
  const { createPost, creatingPost, created } = useCreate();

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
  } = useUpdate();

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
    savePost({ editor, forReview });
  };

  /**
   * for autosave
   */
  const debounceSave = useCallback(
    debounce(async ({ editor, forReview }) => {
      setSaving(false);
      savePost({ editor, forReview });
    }, saveDebounceDelay),
    [user, postId, postObject, postStatus]
  );

  /**
   * savePost
   * when save button is clicked
   * save the post to the backend
   *
   * for new post, create a new post and redirect to the new post
   * @param {*} param0
   * @returns
   */
  const savePost = async ({ editor, forReview }) => {
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
        if (!router.query.slug) {
          const postInfo = await createPost({ user, editor, forReview });
          // Set the new slug
          localStorage.removeItem("wipContent");

          router.replace(
            {
              pathname: router.pathname,
              query: { slug: postInfo?.id },
              as: `/p/${postInfo?.id}`,
            },
            undefined,
            { shallow: true }
          );

          refetch();
          return true;
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
          {(user && !user?.isLoggedIn) || initialContent == null ? (
            // <Layout>
            <div className="my-auto h-screen flex flex-col justify-center text-center">
              <div className="mx-auto opacity-50">
                <Spinner />
              </div>
            </div>
          ) : (
            // </Layout>
            user?.isLoggedIn && (
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
                      updatePostSettings={
                        user?.isAdmin ? updatePostSettings : false
                      }
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