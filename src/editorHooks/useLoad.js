import React from "react";
import { useEffect, useState } from "react";
import { getInterViewTemplate } from "./libs/templates/interviewTemplate";

/**
 * useLoad hook for loading post content
 *
 * Handles loading content from local storage (for new posts) and from the backend (for existing posts)
 *
 * @param {object} params - The parameters for the hook
 * @param {object} params.user - The user object
 * @param {boolean} params.interview - Flag indicating if it's an interview
 * @param {string} params.productName - The product name
 * @returns {object} - The hook state and functions
 */
const useLoad = ({
  user,
  interview,
  productName,
  loadPostOperation,
  routerPostId=false,
  requireLogin
} = {}) => {
  // const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [postId, setPostId] = useState(()=>{
   if( routerPostId){
    return routerPostId
   }
  });
  const [slug, setSlug] = useState(null);
  const [postObject, setPostObject] = useState(false);
  const [title, setTitle] = useState(null);
  const [postStatus, setStatus] = useState("draft");

  // New function to check user access
  const hasUserAccess = () => {
    return (requireLogin === true && user.isLoggedIn) || requireLogin === false;
  };

  // Load content when user or postId changes
  useEffect(() => {
    if (hasUserAccess()) {
      if (routerPostId) {
        setPostId(routerPostId);
      } else {
        refetch();
      }
    }
  }, [routerPostId, user]);

  useEffect(() => {
    if (postId && hasUserAccess()) {
      refetch();
    }
  }, [postId, user.isLoggedIn]);

  // Refetch content
  const refetch = async () => {
    if (postId) {
      await getPostFromDB();
      setLoading(false);
    } else {
      //load local content
      setIsOwner(true);
      setCanEdit(true);
      getPostFromLocalStorage();
      setLoading(false);
    }
  };

  // Load local content for new posts
  const getPostFromLocalStorage = () => {
    let retrievedObject = localStorage.getItem("wipContent");
    if (interview) {
      retrievedObject = localStorage.getItem("wipInterview");
    }
    if (retrievedObject) {
      setInitialContent(JSON.parse(retrievedObject));
    } else {
      if (interview) {
        setInitialContent(getInterViewTemplate({ productName }));
      } else {
        setInitialContent(false);
      }
    }
  };

  // Fetch current post from the backend
  const getPostFromDB = async () => {
    try {
      if(!postId){
        setInitialContent(false);
        return false
      }
      const post = await loadPostOperation(user, postId);

      if (post) {
        setPostObject(post);
        setIsOwner(true);
        setCanEdit(true);
        setSlug(post?.slug);
      } else {
        setInitialContent(false);
      }
    } catch (e) {
      // setInitialContent(false);
      console.log(e);
    }
  };

  /**
   * when postObject is available, set the initial content
   * and other data
   */
  useEffect(() => {
    if (postObject) {
      setPostId(postObject?.id);

      //set content
      // update for #54
      // load from draft_content if available (draft_content is cleared when post is published/submitted for review)
      let content = "";

      if (postObject?.draft_content?.length) {
        content = postObject?.draft_content;
      } else if (postObject?.content?.length) {
        // legacy support - if there is no draft_content, load content
        content = postObject?.content;
      }
      if (postObject?.draft_title?.length) {
        //set title
        setTitle(postObject?.draft_title);
        if (
          postObject?.draft_title &&
          content.indexOf(postObject?.draft_title) == -1
        ) {
          content = `<h1>${postObject?.draft_title}</h1>${content}`;
        }
      } else if (postObject?.title?.length) {
        //set title
        setTitle(postObject?.title);
        // legacy support - if there is no draft_title, load content
        if (postObject?.title && content.indexOf(postObject?.title) == -1) {
          content = `<h1>${postObject?.title}</h1>${content}`;
        }
      }
      //if title isn't part of body, add it in
      if (content) {
        setInitialContent(content);
      } else {
        setInitialContent(false);
      }
      //set status
      setStatus(postObject?.status);
    }
  }, [postObject]);

  return {
    loading,
    initialContent,
    title,
    postId,
    slug,
    postStatus,
    isOwner,
    postObject,
    canEdit,
    refetch,
    setPostObject,
    setPostId
  };
};

export default useLoad;