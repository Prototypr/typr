import React from "react";

import toast from "react-hot-toast";
import { useState } from "react";
import { checkSessionExpired } from "../utils/checkSessionExpired";
import { getEditPostData } from "./libs/getEditPostData";
import { updatePostObject } from "./libs/helpers/updatePostObjectWithUpdateResults";
const axios = require("axios");

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
const useUpdate = ({ save }) => {
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
    postStatus,
    postObject,
  }) => {
    //create the entry object with updated post data from the editor content
    const { entry } = getEditPostData({
      editor,
      forReview,
      postStatus,
      postObject,
    });

    //check if session expired
    //check if jwt is expired
    const sessionExpired = checkSessionExpired(user?.jwt);
    if (sessionExpired) {
      alert("Your sessions has expired. Please log in again.");
      return false;
    }

    setSaving(true);
    setSaved(false);
    let saveData = null
    try {
      saveData = await save({ entry, postId });
      // console.log(saveData)
      if(saveData){
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
        } else if (forReview && postStatus == "publish") {
          toast.success("Your post has been updated!", {
            duration: 5000,
          });
  
          localStorage.removeItem("wipContent");
        } else {
          // toast.success("Your draft has been updated!", {
          //   duration: 5000,
          // });
  
          localStorage.removeItem("wipContent");
        }
      }else{
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
      updatedObject: saveData?.data?.data?.attributes,
      existingObject: postObject,
    });

    return updatedObject;
  };

  /**
   * updatePostSettings
   */
  const updatePostSettings = async ({ postId, user, settings, postObject }) => {
    // Deep merge function to handle nested objects
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] && typeof source[key] === 'object') {
            target[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    // Merge the new settings with the existing postObject
    const mergedEntry = deepMerge({
      type: "article",
      ...postObject
    }, settings);


    if(!postId){
      toast.error("Post ID is required to update settings.", {
        duration: 5000,
      });
      return false
    }
      
  
    //check if session expired
    //check if jwt is expired
    const sessionExpired = checkSessionExpired(user?.jwt);
    if (sessionExpired) {
      alert("Your sessions has expired. Please log in again.");
      return false;
    }

    setSaving(true);
    setSaved(false);
    let saveData = null
    try {
      saveData = await save({ entry:mergedEntry, postId });
      if(saveData){
        setTimeout(() => {
          setSaving(false);
          setHasUnsavedChanges(false);
          setSaved(true);
        }, 1000);
      }
      toast.success("Article settings updated!", {
        duration: 5000,
      });
    } catch (e) {
      setSaving(false);
      setHasUnsavedChanges(true);
      toast.error("Settings could not be saved!", {
        duration: 5000,
      });
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