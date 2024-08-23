import {
  getTitle,
  getExcerpt,
  getCoverImage,
  getContent,
  getSeoData,
  getLegacyFeaturedImage,
} from "./helpers/editorDataFormatter";

export const getEditPostData = ({
  editor,
  forReview,
  postStatus,
  postObject,
  enablePublishingFlow,
  POST_STATUSES,
  publish,
  unpublish,
  autosave
}) => {
  const html = editor.getHTML();
  const json = editor.getJSON()?.content;

  const title = getTitle({ editor });
  const content = getContent({ html, title });
  const excerpt = getExcerpt({ json, postObject });
  const coverImage = getCoverImage({ postObject, json });
  const seo = getSeoData({ postObject, title, excerpt, coverImage });
  const legacyFeaturedImage = getLegacyFeaturedImage({ coverImage });

  const getPublishStatus = () =>{
    if (forReview) {
      if (!postObject?.status || (postObject?.status === POST_STATUSES.DRAFT)) {
        return POST_STATUSES.PENDING || POST_STATUSES.PUBLISHED;
      }else if(enablePublishingFlow && (postObject?.status==POST_STATUSES.PENDING || postObject?.status==POST_STATUSES.PUBLISHED)){
        return postObject?.status;
      }
      else if (postStatus) {
        return postStatus === POST_STATUSES.PUBLISHED ? POST_STATUSES.PUBLISHED : POST_STATUSES.DRAFT;
      }
    }else{
      return postObject?.status;
    }
  }

  if (enablePublishingFlow !== false || (autosave==true && !publish && !unpublish)) {
    let entry = {
      status: getPublishStatus(),
      // removed content for issue #54
      // content: content,
      // #54 save content to versioned_content instead:
      versioned_title: title,
      versioned_content: content,
    };

    if (forReview && content) {
      //clear the draft version
      entry.versioned_content = "";
      entry.content = content;
      entry.versioned_title = "";
      entry.title = title;
    }

    //change the date on save only if postStatus==draft or postStatus==pending publish
    if (postObject?.status !== POST_STATUSES.PUBLISHED) {
      entry.date = new Date();
    }

    if (forReview || postStatus == POST_STATUSES.PUBLISHED) {
      //only save seo and excerpt if it's for review - then it'll be the latest data
      entry.seo = seo;
      entry.excerpt = excerpt;
      entry.legacyFeaturedImage = legacyFeaturedImage;
    }

    return {
      entry,
    };
  } else {

    let entry = {
      title: title,
      content: content,
      featuredImage: coverImage,
      versioned_title: '',
      versioned_content: '',
      excerpt: excerpt,
      seo: seo,
    };

    if(publish==true){
      entry.status = POST_STATUSES.PUBLISHED;
    }else if(unpublish==true){
      entry.status = POST_STATUSES.DRAFT;
    }

    return {
      entry:entry,
    };
  }
};