import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import useLoad from "../editorHooks/useLoad";
import useCreate from "../editorHooks/useCreate";
import useUpdate from "../editorHooks/useUpdate";
import { useConfirmTabClose } from "../editorHooks/useConfirmTabClose";
import { addTwitterScript } from "../editorHooks/libs/addTwitterScript";
import { customDeepMerge } from "../utils/customDeepMerge";
import { defaultProps } from "../config/defaultProps";

const saveDebounceDelay = 2700;

// Define PostStatus here
const PostStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "publish",
  // Add more default statuses as needed
};

export function useEditorWrapper(props) {
  const mergedProps = React.useMemo(() => {
    try {
      return customDeepMerge(defaultProps, props);
    } catch (error) {
      console.error("Error merging props:", error);
      return { ...defaultProps, ...props };
    }
  }, [props]);

  // Extract necessary props
  const {
    user,
    postId: routerPostId,
    postOperations,
    requireLogin,
    enablePublishingFlow,
    customPostStatuses,
    isInterview,
    tool,
    components,
    autosave,
  } = mergedProps;

  // State and other hooks
  const [settingsOptions, setSettingsOptions] = useState({
    general: components?.settingsPanel?.generalTab?.menu || [],
    seo: components?.settingsPanel?.seoTab?.menu || [],
  });

  const [contentReady, setContentReady] = useState(false);
  const [unpublishedChanges, setUnpublishedChanges] = useState(false);

  const POST_STATUSES = React.useMemo(
    () => ({
      ...PostStatus,
      ...(customPostStatuses || {}),
    }),
    [customPostStatuses]
  );

  // Existing hooks
  const loadHookResult = useLoad({
    user,
    routerPostId,
    requireLogin,
    interview: isInterview,
    productName: tool?.name ? tool.name : false,
    loadPostOperation: postOperations.load,
    enablePublishingFlow,
    POST_STATUSES,
  });

  const { createPost, creatingPost, created } = useCreate({
    enablePublishingFlow,
    POST_STATUSES,
    autosave,
  });

  const updateHookResult = useUpdate({
    savePostOperation: postOperations.save,
    enablePublishingFlow,
    POST_STATUSES,
    autosave,
  });

  useConfirmTabClose(updateHookResult.hasUnsavedChanges);

  // Effects
  useEffect(() => {
    addTwitterScript();
  }, []);

  useEffect(() => {
    if (loadHookResult.initialContent !== null) {
      setContentReady(true);
    }
  }, [loadHookResult.initialContent]);

  useEffect(() => {
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const updateSettingsArray = array =>
      array.map(option => ({
        ...option,
        initialValue:
          option.field && loadHookResult.postObject?.id
            ? getNestedValue(loadHookResult.postObject, option.field) ?? option.initialValue
            : option.initialValue,
      }));

    setSettingsOptions({
      general: updateSettingsArray(
        components?.settingsPanel?.generalTab?.menu || []
      ),
      seo: updateSettingsArray(components?.settingsPanel?.seoTab?.menu || []),
    });
  }, [components?.settingsPanel, loadHookResult.postObject]);

  useEffect(() => {
    if (
      (loadHookResult.postObject.versioned_content != null &&
        loadHookResult.postObject.content !== loadHookResult.postObject.versioned_content) ||
      (loadHookResult.postObject.versioned_title != null &&
        loadHookResult.postObject.title !== loadHookResult.postObject.versioned_title)
    ) {
      setUnpublishedChanges(true);
    } else {
      setUnpublishedChanges(false);
    }
  }, [loadHookResult.postObject]);

  const debouncedSave = useDebouncedCallback(async ({ editor, forReview }) => {
    updateHookResult.setSaving(false);
    await _savePost({ editor, forReview });
  }, saveDebounceDelay);

  const updatePost = ({ editor, json, forReview, publishFlowEnabled }) => {
    if (loadHookResult.postId) {
      updateHookResult.setHasUnsavedChanges(true);
      if (publishFlowEnabled || autosave == true) {
        setTimeout(() => {
          updateHookResult.setSaving(!updateHookResult.saving);
        }, 2700);
        debouncedSave({ editor, forReview });
      } else if (publishFlowEnabled == false) {
        localStorage.removeItem("wipContent");
        localStorage.setItem("wipContent_" + loadHookResult.postId, JSON.stringify(json));
      }
    } else {
      if (publishFlowEnabled || autosave == true) {
        localStorage.setItem("wipContent", JSON.stringify(json));
        setTimeout(() => {
          if (!editor.state.doc.textContent.trim() === "") {
            updateHookResult.setSaving(!updateHookResult.saving);
          }
        }, 2700);
        debouncedSave({ editor, forReview });
      } else {
        updateHookResult.setHasUnsavedChanges(true);
        localStorage.setItem("wipContent", JSON.stringify(json));
      }
    }
  };

  const forceSave = async ({ editor, json, forReview, publish, unpublish }) => {
    updateHookResult.setSaving(false);
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
    if (
      editor.state.doc.textContent.trim() === "" &&
      editor.state.doc.childCount <= 2
    ) {
      return false;
    }

    try {
      if (
        (enablePublishingFlow === false && autosave !== true) ||
        (enablePublishingFlow === false && forced == true)
      ) {
        if (loadHookResult.postId) {
          localStorage.removeItem("wipContent");
          localStorage.setItem(
            "wipContent_" + loadHookResult.postId,
            JSON.stringify(editor.state.doc.toJSON())
          );
        } else {
          localStorage.setItem(
            "wipContent",
            JSON.stringify(editor.state.doc.toJSON())
          );
        }

        if (forced && !publish && !unpublish && !loadHookResult.postId) {
          const postInfo = await createPost({
            user,
            editor,
            createPostOperation: postOperations.create,
          });

          if (postInfo?.id) {
            loadHookResult.setPostId(postInfo?.id);
            mergedProps.hooks.onPostCreated({ id: postInfo?.id, postInfo });
          }
          localStorage.removeItem("wipContent");

          return true;
        } else if (forced && loadHookResult.postId) {
          const updatedPostObject = await updateHookResult.updatePostById({
            editor: editor,
            postId: loadHookResult.postId,
            user: user,
            forReview: forReview,
            forced: forced,
            publish: publish,
            unpublish: unpublish,
            postStatus: loadHookResult.postStatus,
            postObject: loadHookResult.postObject,
            enablePublishingFlow: enablePublishingFlow,
          });
          if (updatedPostObject?.id) {
            loadHookResult.setPostObject(updatedPostObject);
            updateHookResult.setHasUnsavedChanges(false);
          }
        }

        return true;
      } else if (loadHookResult.postId) {
        const updatedPostObject = await updateHookResult.updatePostById({
          editor: editor,
          postId: loadHookResult.postId,
          user: user,
          forReview: forReview,
          postStatus: loadHookResult.postStatus,
          postObject: loadHookResult.postObject,
          enablePublishingFlow: enablePublishingFlow,
        });

        if (updatedPostObject) {
          loadHookResult.setPostObject(updatedPostObject);
          updateHookResult.setHasUnsavedChanges(false);
        }
        return true;
      } else {
        if (!routerPostId && typeof postOperations.create === "function") {
          if (editor.state.doc.textContent.trim() === "") {
            return false;
          }

          const postInfo = await createPost({
            user: user,
            editor,
            createPostOperation: postOperations.create,
            enablePublishingFlow: enablePublishingFlow,
          });
          localStorage.removeItem("wipContent");

          if (postInfo?.id) {
            loadHookResult.setPostId(postInfo?.id);
            mergedProps.hooks.onPostCreated({ id: postInfo?.id, postInfo });
          }
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

  const updatePostSettings = async ({ settings }) => {
    try {
      const updatedPostObject = await updateHookResult.updateSettings({
        postId: loadHookResult.postId,
        user: user,
        settings: settings,
        postObject: loadHookResult.postObject,
      });

      if (updatedPostObject?.id) {
        loadHookResult.setPostObject(updatedPostObject);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  return {
    ...loadHookResult,
    ...updateHookResult,
    createPost,
    creatingPost,
    created,
    contentReady,
    unpublishedChanges,
    settingsOptions,
    updatePost,
    forceSave,
    updatePostSettings,
    POST_STATUSES,
  };
}