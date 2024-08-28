import React from "react";
import { useEffect, useState } from "react";
import { getInterViewTemplate } from "./libs/templates/interviewTemplate";
import toast, { Toaster } from "react-hot-toast";
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
  routerPostId = false,
  requireLogin,
  enablePublishingFlow,
  POST_STATUSES,
} = {}) => {
  // const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [postId, setPostId] = useState(-1);
  const [slug, setSlug] = useState(null);
  const [postObject, setPostObject] = useState(false);
  const [title, setTitle] = useState(null);
  const [postStatus, setPostStatus] = useState(POST_STATUSES.DRAFT);
  const [activeToasts, setActiveToasts] = useState(new Set());

  const [refetching, setRefetching] = useState(false)

  // New function to check user access
  const hasUserAccess = () => {
    return (requireLogin === true && user?.isLoggedIn) || requireLogin === false;
  };

  // Load content when user or postId changes
  useEffect(() => {
    if (hasUserAccess()) {
      if (routerPostId && routerPostId !== -1) {
        setPostId(routerPostId);
      } else if (routerPostId === -1) {
        setPostId(-1)
        setLoading(true)
      }
       else {
        setPostId(false);
        if (!postId && postId !== -1) {
          
          refetch();
        }
      }
    }
  }, [routerPostId, user?.isLoggedIn]);

  useEffect(() => {
    if ((postId && postId !== -1) && (hasUserAccess()==true)) {
      refetch();
    } else if ((!postId && postId !== -1) && hasUserAccess()) {
      setPostObject({
        status: POST_STATUSES.DRAFT,
      });
      setPostId(false);
      setInitialContent(false);
      setTitle(null);
      setPostStatus(POST_STATUSES.DRAFT);
      setSlug(null);
      setLoading(false);
      setCanEdit(true);
      setIsOwner(true);
      setTimeout(() => {
        refetch();
      }, 100);
    }
    // }, [postId, user.isLoggedIn]);
  }, [postId, user?.isLoggedIn]);

  // Refetch content
  const refetch = async () => {
    // if (refetching) {
    //   console.log("Already refetching, skipping");
    //   return;
    // }

    setRefetching(true);

    try {
      if(postId === -1){
        setLoading(true)
        return 
      }
      if ((postId && postId !== -1) && enablePublishingFlow !== false) {
        await getPostFromDB();
        setLoading(false);
      } else if ((postId && postId !== -1) && enablePublishingFlow === false) {
        //load local content by id - check local storage first:
        let localContent = localStorage.getItem("wipContent_" + postId);
        if (localContent) {
          setIsOwner(true);
          setCanEdit(true);
          await getPostFromDB(localContent);
          setLoading(false);
        } else {
          //no content found, try to load from database with postid
          await getPostFromDB();
          setLoading(false);
        }
      } else {
        //load local content
        setIsOwner(true);
        setCanEdit(true);
        getPostFromLocalStorage();
        setLoading(false);
      }
    } finally {
      setRefetching(false);
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

  // Function to show toast if not already displayed
  const showToast = message => {
    if (!activeToasts.has(message)) {
      toast.error(message, {
        id: message,
        onClose: () => {
          setActiveToasts(prev => {
            const newSet = new Set(prev);
            newSet.delete(message);
            return newSet;
          });
        },
      });
      setActiveToasts(prev => new Set(prev).add(message));
    }
  };

  // Fetch current post from the backend
  const getPostFromDB = async localContent => {
    try {
      if(!postId && postId !== -1){
        if(!localContent) {
          setInitialContent(false);
        }
        return false
      }
      const post = await loadPostOperation({ user, postId: postId });
      if (!post?.id) {
        //post is not found
        showToast("Post not found. No id returned.");
        if (!localContent) {
          setInitialContent(false);
        }
        return false;
      }

      if (
        post?.title === undefined &&
        post?.versioned_title === undefined &&
        post?.content === undefined &&
        post?.versioned_content === undefined
      ) {
        showToast("Post title and content required.");
        if (!localContent) {
          setInitialContent(false);
        }
        return false;
      }

      if (post) {
        if (!post.status) {
          post.status = POST_STATUSES.DRAFT;
        }
        setPostObject(post);
        // if(localContent){
        //   setInitialContent(JSON.parse(localContent));
        // }
        setIsOwner(true);
        setCanEdit(true);
        setSlug(post?.slug);
      } else {
        setPostObject(null);
        if (!localContent) {
          setInitialContent(false);
        }
      }
    } catch (e) {
      setPostObject(null);
      console.log(e);
    }
  };

  /**
   * when postObject is available, set the initial content
   * and other data
   */
  useEffect(() => {
    if (postObject) {
      // setPostId(postObject?.id);

      //set content
      // update for #54
      // load from versioned_content if available (versioned_content is cleared when post is published/submitted for review)
      let content = "";

      if (postObject?.versioned_content?.length) {
        content = postObject?.versioned_content;
      } else if (postObject?.content?.length) {
        // legacy support - if there is no versioned_content, load content
        content = postObject?.content;
      }
      if (postObject?.versioned_title?.length) {
        //set title
        setTitle(postObject?.versioned_title);
        if (
          postObject?.versioned_title &&
          content.indexOf(postObject?.versioned_title) == -1
        ) {
          content = `<h1>${postObject?.versioned_title}</h1>${content}`;
        }
      } else if (postObject?.title?.length) {
        //set title
        setTitle(postObject?.title);
        // legacy support - if there is no versioned_title, load content
        if (postObject?.title && content.indexOf(postObject?.title) == -1) {
          content = `<h1>${postObject?.title}</h1>${content}`;
        }
      }
      //if title isn't part of body, add it in
      if (content) {
        if (enablePublishingFlow == false) {
          //get content from local storage
          let retrievedObject = localStorage.getItem("wipContent_" + postId);
          if (retrievedObject) {
            setInitialContent(JSON.parse(retrievedObject));
          } else {
            setInitialContent(content);
          }
        } else {
          setInitialContent(content);
        }
      } else {
        setInitialContent(false);
      }
      //set status
      const statusKey =
        Object.keys(POST_STATUSES).find(
          key => POST_STATUSES[key] === postObject?.status
        ) || "DRAFT";
      setPostStatus(POST_STATUSES[statusKey]);
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
    setPostId,
    refetching,
  };
};

export default useLoad;