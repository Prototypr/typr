import React from "react";
import Button from "../../Primitives/Button";
import Spinner from "../../atom/Spinner/Spinner";

import { PublishDialogButton } from "./PublishDialogButton";
import SidePanelTrigger from "./SidePanel/SidePanelTrigger";
import { PublishChangesDialog } from "./PublishChangesDialog";
/**
 * EditorButtons
 * render buttons for saving and publishing
 * in the editor, these are wrapped in a portal so they can be rendered on the navbar
 * @param {*} param0
 * @returns
 */
const EditorNavButtons = ({
  //general stuff
  user,
  canEdit,
  onSave,
  isSaving,
  editor,
  //for updating existing post
  refetchPost,
  postObject,

  settingsPanelSettings,
  settingsOptions,

  updatePostSettings,
  theme,
  enablePublishingFlow,
  forceSave,
  POST_STATUSES,
  hasUnsavedChanges,
  unpublishedChanges,
  autosave,
}) => {

  return (
    <>
    <div className="flex gap-0.5">
      {(enablePublishingFlow == false && user?.isLoggedIn && !autosave) ? (
        <Button
          disabled={!canEdit ||isSaving || !hasUnsavedChanges}
          variant="ghostBlue"
          onClick={()=>forceSave({ editor,json: editor.getJSON() })}
          className={`${!enablePublishingFlow && (postObject?.status == POST_STATUSES.PUBLISHED || postObject?.status == POST_STATUSES.PENDING) ? (theme === 'blue' ? '!bg-blue-600 !outline-blue-600' : '!bg-gray-700 !outline-gray-700') + ' !text-white' : (theme === 'blue' ? '!outline-blue-600 !text-blue-600' : '!outline-gray-600 !text-gray-700')} !text-[13px] font-normal !h-[25px] !px-2 my-auto !mr-2 ${isSaving || !hasUnsavedChanges ?' !opacity-50 !cursor-not-allowed':''} !outline !outline-1 !rounded-full`}
        >
          {isSaving ? <Spinner size={14} className="mx-auto"/> :(postObject.status == POST_STATUSES.DRAFT || postObject.status== null)? "Save draft" : "Save"}
        </Button>
      ) : null}
      {/* show publish button if post not published */}
      {/* publish button does same as save draft button, but uses dialog and adds 'forReview' flag */}

      {postObject ? (
        <PublishDialogButton
          className={` ${postObject.status==POST_STATUSES.DRAFT?'':'order-first'}`}
          postObject={postObject}
          canPublish={canEdit && postObject?.id ? true : false}
          POST_STATUSES={POST_STATUSES}
          editor={editor}
          //save post creates a post or updates an existing one
          //for /write (new post), it creates a new post
          //for /p/[slug] (existing post), it updates the existing post
          onSave={onSave}
          forceSave={forceSave}
          theme={theme}
          enablePublishingFlow={enablePublishingFlow}
        />
      ) : null}
      {(!enablePublishingFlow) && postObject && autosave==true && postObject.status==POST_STATUSES.PUBLISHED ? (
        <PublishChangesDialog
          className={` ${postObject.status==POST_STATUSES.DRAFT?'':'order-first'}`}
          postObject={postObject}
          canPublish={canEdit && unpublishedChanges}
          POST_STATUSES={POST_STATUSES}
          editor={editor}
          //save post creates a post or updates an existing one
          //for /write (new post), it creates a new post
          //for /p/[slug] (existing post), it updates the existing post
          onSave={onSave}
          forceSave={forceSave}
          theme={theme}
          enablePublishingFlow={enablePublishingFlow}
        />
      ) : null}
    </div>


      {/* show side panel trigger if updatePostSettings is defined (in /p/[slug]) */}
      {(postObject?.id && (editor && settingsPanelSettings?.show == true)) ? (
        <SidePanelTrigger
          theme={theme}
          user={user}
          editor={editor}
          postObject={postObject}
          updatePostSettings={updatePostSettings}
          settingsPanelSettings={settingsPanelSettings}
          settingsOptions={settingsOptions}
          refetchPost={refetchPost}
        />
      ) : null}
    </>
  );
};

export default EditorNavButtons;