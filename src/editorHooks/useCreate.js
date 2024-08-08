import React from "react";
import toast from "react-hot-toast";
import { getCreatePostData } from "./libs/getCreatePostData";
import { useState } from "react";

const useCreate = ({POST_STATUSES,enablePublishingFlow}) => {
  const [creatingPost, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const createPost = async ({ user, postObject, editor, forReview, relatedPost, createPostOperation}) => {
    setCreating(true);
    if (created) {
      throw new Error("Post already created");
    }
    const { entry } = getCreatePostData({
      editor,
      postObject,
      user,
      relatedPost,
      forReview,
      enablePublishingFlow,
      POST_STATUSES
    });

    try {


     let postResult = await createPostOperation({entry})

     if(postResult){
      setCreated(true);
      setTimeout(() => {
        setCreating(false);
      }, 1000);
    }else{
      setCreating(false);
      toast.error("Error creating draft! No post ID returned.", {
        duration: 5000,
      });
      // toast.error("Error creating draft! Please contact support for help.", {
      //   duration: 5000,
      // });
    }

      return postResult;
    } catch {
      toast.error("Error creating draft! Please contact support for help.", {
        duration: 5000,
      });
      e => console.log(e);
    }
  };

  return { createPost, creatingPost, created };
};

export default useCreate;
