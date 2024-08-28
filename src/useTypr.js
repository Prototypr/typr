import React, { useEffect, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

import { addTwitterScript } from "./editorHooks/libs/addTwitterScript";

import useLoad from "./editorHooks/useLoad";
import useCreate from "./editorHooks/useCreate";
import useUpdate from "./editorHooks/useUpdate";
import { useConfirmTabClose } from "./editorHooks/useConfirmTabClose";
import { customDeepMerge } from "./utils/customDeepMerge";
import { defaultProps } from "./config/defaultProps";

export const PostStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "publish",
  // Add more default statuses as needed
};

const saveDebounceDelay = 2700;

export const useTypr = props => {

  const { ...restProps } = props;

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
    mediaHandler,
    hooks,
    router,
    childProps,

    requireLogin,
    enablePublishingFlow,
    customPostStatuses,
    editorWidth,

    tool,
    isInterview,
    extensions,
    onReady: onEditorReady,
    editorSettings,
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


  const [editorInstance, setEditorInstance] = useState(null);

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
    loadPostOperation: postOperations?.load,
    enablePublishingFlow,
    POST_STATUSES,
  });

  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (initialContent !== null) {
      setContentReady(true);
    }
  }, [initialContent]);

  useEffect(() => {
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const updateSettingsArray = array =>
      array.map(option => ({
        ...option,
        initialValue:
          option.field && postObject?.id
            ? getNestedValue(postObject, option.field) ?? option.initialValue
            : option.initialValue,
      }));

    setSettingsOptions(prevOptions => {
      const newOptions = {
        general: updateSettingsArray(
          components?.settingsPanel?.generalTab?.menu || []
        ),
        seo: updateSettingsArray(components?.settingsPanel?.seoTab?.menu || []),
      };

      // Only update state if there are actual changes
      if (
        JSON.stringify(prevOptions.general) !==
          JSON.stringify(newOptions.general) ||
        JSON.stringify(prevOptions.seo) !== JSON.stringify(newOptions.seo)
      ) {
        return newOptions;
      }

      return prevOptions;
    });
  }, [components?.settingsPanel, postObject]);

  const [unpublishedChanges, setUnpublishedChanges] = useState(false);
  useEffect(() => {
    if (
      (postObject.versioned_content != null &&
        postObject.content !== postObject.versioned_content) ||
      (postObject.versioned_title != null &&
        postObject.title !== postObject.versioned_title)
    ) {
      // If there are differences, set unpublishedChanges to true
      setUnpublishedChanges(true);
    } else {
      // If there are no differences, set unpublishedChanges to false
      setUnpublishedChanges(false);
    }
  }, [postObject]);

  //create new post hook
  const { createPost, creatingPost, created } = useCreate({
    enablePublishingFlow,
    POST_STATUSES,
    autosave: mergedProps.autosave,
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
    savePostOperation: postOperations?.save,
    enablePublishingFlow,
    POST_STATUSES,
    autosave: mergedProps.autosave,
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
    // Update the editorInstance state when the editor updates

    // send the content to an API here (if new post only)
    if (postId) {
      setHasUnsavedChanges(true);
      if (publishFlowEnabled || mergedProps.autosave == true) {
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
      if (publishFlowEnabled || mergedProps.autosave == true) {
        localStorage.setItem("wipContent", JSON.stringify(json));
        setTimeout(() => {
          if (!editor.state.doc.textContent.trim() === "") {
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

  const forcePublish = useCallback(() => {
    if (editorInstance) {
      forceSave({ editor: editorInstance, publish: true});
    }
  }, [editorInstance]);

  const forceUnpublish = useCallback(() => {
    console.log("force unpublish");
    if (editorInstance) {
      forceSave({ editor: editorInstance, unpublish: true });
    }
  }, [editorInstance]);

  /**
   * call save from outside
   */
  const doSave = useCallback(({forReview=false}) => {
    if (editorInstance) {
      forceSave({ editor: editorInstance, forReview });
    }
  }, [editorInstance]);

  /**
   * bypass debounce and save immediately
   * @param {*} param0
   */
  const forceSave = async ({ editor, json, forReview, publish, unpublish }) => {
    setSaving(false);
    if (publish !== undefined || unpublish !== undefined) {
      const res = await _savePost({
        editor,
        forReview,
        forced: true,
        publish,
        unpublish,
      });
      return res;
    } else {
      const res = await _savePost({ editor, forReview, forced: true });
      return res;
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
      if (
        (enablePublishingFlow === false && mergedProps.autosave !== true) ||
        (enablePublishingFlow === false && forced == true)
      ) {
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
          return true;
        }
        if (!routerPostId && typeof postOperations?.save !== "function") {
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

  const _onEditorReady = ({ editor }) => {
      setEditorInstance(editor);
      if (typeof onEditorReady === 'function') {
        onEditorReady({ editor });
      }
  };

  return {
    postId,
    postObject,
    initialContent,
    hasUnsavedChanges,
    unpublishedChanges,
    saving,
    creatingPost,
    saved,
    created,
    contentReady,
    slug,
    canEdit,
    settingsOptions,
    POST_STATUSES,
    theme,
    components,
    user,
    postOperations,
    mediaHandler,
    hooks,
    router,
    childProps,
    requireLogin,
    enablePublishingFlow,
    customPostStatuses,
    editorWidth,
    tool,
    isInterview,
    extensions,
    mergedProps,
    editorSettings,
    updatePost,
    forceSave,
    refetch,
    updatePostSettings,
    _onEditorReady,
    
    editor: editorInstance, 
    publish:forcePublish,
    unpublish:forceUnpublish,
    save:doSave,
  };
};
