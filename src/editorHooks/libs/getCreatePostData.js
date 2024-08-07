import {
  getTitle,
  getContent,
  getCoverImage,
  // getLegacyFeaturedImage,
  uid,
  getPostRelation
} from "./helpers/editorDataFormatter";

export const getCreatePostData = ({
  editor,
  postObject,
  user,
  relatedPost,
  enablePublishingFlow,
  POST_STATUSES
}) => {
  const html = editor.getHTML();
  const json = editor.getJSON()?.content;

  const title = getTitle({ editor });
  const content = getContent({ html, title });
  const coverImage = getCoverImage({ postObject, json });
  // don't bother creating seo data before publishing
  // const seo = getSeoData({ postObject, title, excerpt, coverImage });
  // const legacyFeaturedImage = getLegacyFeaturedImage({ coverImage });

  //create post slug - just use a unique id and the date
  const slug = `${uid()}--${user?.id}`;

  const postRelation = getPostRelation({ relatedPost, postObject });
  
  if(enablePublishingFlow!==false){

    let entry = {
      // type: "article",
      status: POST_STATUSES.DRAFT,
      title:'',
      content: '',
      draft_title: title,
      draft_content: content,
      slug: slug, //slug is always the same when editing a draft
      userId: user?.id,
    };
  
    if(postRelation) {
      // entry.tools = [postRelation];
      entry.relation = [postRelation];
    }
  
    //change the date on save only if postStatus==draft or postStatus==pending publish
    // if (postObject?.status !== "publish") {
    //   entry.date = new Date();
    // }
  
    return {
      entry,
    };
  }else{
    return {
      entry: {
        title: title,
        content: content,
      }
    }
  }

};
