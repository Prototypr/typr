import React from "react";

import toast from "react-hot-toast";
import { useState } from "react";
import { getEditPostData } from "./libs/getEditPostData";
import { updatePostObject } from "./libs/helpers/updatePostObjectWithUpdateResults";
import { isValid, parseISO } from "date-fns";

/**
 * updates a post based on its postId
 *
 * used in the editor to save existing post drafts, submit for review, or publish
 *
 * @param {*} postId
 * @param {*} user
 * @param {*} editor
 * @param {*} slug
 * @param {*} forReview
 * @param {*} postStatus
 * @param {*} postObject
 *
 * @returns
 */
const useUpdate = ({ savePostOperation, POST_STATUSES, autosave }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(undefined);

  /**
   * updatePost
   * @param {*} param0
   * @returns updated postObject
   */
  const updatePost = async ({
    postId,
    user,
    editor,
    forReview,
    forced,
    publish,
    unpublish,
    postStatus,
    postObject,
    enablePublishingFlow,
  }) => {
    //create the entry object with updated post data from the editor content
    const { entry } = getEditPostData({
      editor,
      forReview,
      postStatus,
      postObject,
      enablePublishingFlow,
      publish,
      unpublish,
      POST_STATUSES,
      autosave
    });

    setSaving(true);
    setSaved(false);


    const mergedEntry = deepMerge({}, entry);
    // For nested objects, merge with existing postObject data, except for date fields
    for (const key in mergedEntry) {
      if (
        typeof mergedEntry[key] === "object" &&
        mergedEntry[key] !== null &&
        postObject[key] &&
        !isDateField(mergedEntry[key])
      ) {
        mergedEntry[key] = deepMerge(postObject[key], mergedEntry[key]);
      }
    }

    for (const key in mergedEntry) {
      if (
        typeof mergedEntry[key] === "object" &&
        mergedEntry[key] !== null &&
        postObject[key] &&
        !isDateField(mergedEntry[key])
      ) {
        mergedEntry[key] = deepMerge(postObject[key], mergedEntry[key]);
      }
    }

    let saveData = null;

    try {
      const savePostData = deepMerge(postObject, mergedEntry);
      localStorage.removeItem("wipContent_" + postId);
      saveData = await savePostOperation({
        entry: { ...savePostData },
        postId,
      });
      // console.log(saveData)
      if (saveData) {
        setTimeout(() => {
          setSaving(false);
          setHasUnsavedChanges(false);
          setSaved(true);
        }, 1000);

        if (forReview && postStatus !== "publish") {
          toast.success("Submitted for review!", {
            duration: 5000,
          });
          localStorage.removeItem("wipContent");
          localStorage.removeItem("wipContent_" + postId);
        } else if (forReview && postStatus == "publish") {
          toast.success("Your post has been updated!", {
            duration: 5000,
          });
          localStorage.removeItem("wipContent_" + postId);
          localStorage.removeItem("wipContent");
        } else if (forced) {
          toast.success("Your post has been saved!", {
            duration: 5000,
          });
          localStorage.removeItem("wipContent_" + postId);
          localStorage.removeItem("wipContent");
        } else {
          // toast.success("Your draft has been updated!", {
          //   duration: 5000,
          // });

          localStorage.removeItem("wipContent");
        }
      } else {
        setSaving(false);
        setHasUnsavedChanges(true);
        toast.error("Your draft could not be saved!", {
          duration: 5000,
        });
      }
    } catch (e) {
      setSaving(false);
      setHasUnsavedChanges(true);
      toast.error("Your draft could not be saved!", {
        duration: 5000,
      });
      console.log(e);
    }

    //update the initial postobject with the updated data and return it
    const updatedObject = updatePostObject({
      updatedObject: saveData,
      existingObject: postObject,
    });

    return updatedObject;
  };

  /**
   * updatePostSettings
   */
  const updatePostSettings = async ({ postId, user, settings, postObject }) => {
    // Merge properties from settings
    const mergedEntry = deepMerge({}, settings);

    // For nested objects, merge with existing postObject data
    for (const key in mergedEntry) {
      if (
        typeof mergedEntry[key] === "object" &&
        mergedEntry[key] !== null &&
        postObject[key] &&
        !isDateField(mergedEntry[key])
      ) {
        mergedEntry[key] = deepMerge(postObject[key], mergedEntry[key]);
      }
    }

    if (!postId) {
      toast.error("Post ID is required to update settings.", {
        duration: 5000,
      });
      return false;
    }

    setSaving(true);
    setSaved(false);
    let saveData = null;
    try {
      const savePostData = deepMerge(postObject, mergedEntry);

      saveData = await savePostOperation({
        entry: { ...savePostData },
        postId,
      });
      if (saveData) {
        setTimeout(() => {
          setSaving(false);
          setHasUnsavedChanges(false);
          setSaved(true);
        }, 1000);
        toast.success("Article settings updated!", {
          duration: 5000,
        });
        //update the initial postobject with the updated data and return it
        const updatedObject = updatePostObject({
          updatedObject: saveData,
          existingObject: postObject,
        });

        return updatedObject;
      } else {
        toast.error("Settings could not be saved!", {
          duration: 5000,
        });
      }
    } catch (e) {
      setSaving(false);
      setHasUnsavedChanges(true);
      console.log(e);
    }

    //update the initial postobject with the updated data and return it
    const updatedObject = updatePostObject({
      updatedObject: saveData?.data?.data?.attributes,
      existingObject: postObject,
    });

    return updatedObject;
  };

  //return hook stuff
  return {
    updatePostById: updatePost,
    updateSettings: updatePostSettings,
    saving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaving,
    saved,
  };
};

export default useUpdate;

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !isDateField(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};

const isDateField = value => {
  if (value instanceof Date) {
    return isValid(value);
  }
  if (typeof value === "string") {
    return isValid(parseISO(value));
  }
  return false;
};
