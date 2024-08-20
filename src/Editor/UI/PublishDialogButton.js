"use client";

import React, { useState, useEffect } from "react";

import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogContentLarge,
  DialogTitle,
  DialogDescription,
  DialogClose,
  IconButton,
} from "../../Primitives/Dialog";
import Button from "../../Primitives/Button";
import Spinner from "../../atom/Spinner/Spinner";

export const PublishDialogButton = ({
  onSave,
  forceSave,
  editor,
  canPublish,
  postObject,
  theme,
  enablePublishingFlow,
  POST_STATUSES,
  className,
}) => {
  const [submitting, setSubmitting] = useState();
  const [submitOpen, setSubmitOpen] = useState();

  const modalText = {
    publish: {
      title: "Save and Publish",
      description:
        "You have made changes to your story. Publish your changes to make them live.",
      button: "Publish",
    },
    unpublish: {
      title: "Unpublish",
      description:
        "You have made changes to your story. Unpublish your changes to make them live.",
      button: "Unpublish",
    },
    revert: {
      title: "Revert to Draft", 
      description:
        "Your story is currently published. Reverting to draft will unpublish it so it is no longer visible to the public.",
      button: "Revert to Draft",
    },
    submit: {
      title: "Submit for Review",
      description:
        "Your story will be submitted to our publication editors for review. The editors will review your draft and publish it within 1 week if it fits our guidelines, or get back to you with feedback.",
      button: "Submit",
      buttonClassName: `${
        theme == "blue"
          ? "!bg-blue-600 !hover:bg-blue-500 !outline-blue-600"
          : "!bg-gray-600 !hover:bg-gray-500 !outline-gray-600"
      } !text-white !rounded-full`,
    },
  };

  const onSubmit = async () => {
 
    setSubmitting(true);
    if (!enablePublishingFlow && (postObject?.status == POST_STATUSES.DRAFT || postObject?.status == null || postObject?.status == undefined)) {
      forceSave({ publish: true, editor: editor });
    } else if (
      !enablePublishingFlow &&
      (postObject?.status == POST_STATUSES.PUBLISHED ||
        postObject?.status == POST_STATUSES.PENDING)
    ) {
      forceSave({ unpublish: true, editor: editor });
    } else {
      onSave({ forReview: true });
    }
    setSubmitOpen(false);
  };

  const toggleSubmitOpen = () => {
    setSubmitOpen(!submitOpen);
  };

  //reset submitting state when dialog opens
  useEffect(() => {
    if (submitOpen == true) {
      setSubmitting(false);
    }
  }, [submitOpen]);

  const disabled =
    (!(!enablePublishingFlow &&
    (postObject?.status == POST_STATUSES.PUBLISHED ||
      postObject?.status == POST_STATUSES.PENDING))) &&
    (!canPublish ||
      ((postObject?.status == POST_STATUSES.PENDING ||
        postObject?.status == POST_STATUSES.PUBLISHED) &&
        (postObject?.versioned_content?.length == 0 ||
          (postObject?.versioned_content?.length > 0 &&
            postObject?.content == postObject?.versioned_content)) &&
        (postObject?.status == POST_STATUSES.PENDING ||
          postObject?.status == POST_STATUSES.PUBLISHED) &&
        (postObject?.versioned_title?.length == 0 ||
          (postObject?.versioned_title?.length > 0 &&
            postObject?.title == postObject?.versioned_title))));

  return (
    <Dialog onOpenChange={toggleSubmitOpen} open={submitOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          variant="confirmRounded"
          className={`!text-[13px] !font-normal rounded-full ${
            !enablePublishingFlow &&
            (postObject?.status == POST_STATUSES.PUBLISHED ||
              postObject?.status == POST_STATUSES.PENDING)
              ? theme == "blue"
                ? "!text-blue-600 !outline-none !bg-transparent"
                : "!text-gray-600 !outline-none !bg-transparent"
              : theme == "blue"
              ? "bg-blue-600 hover:bg-blue-500 !outline-blue-600 text-white"
              : "bg-gray-600 hover:bg-gray-500 !outline-gray-600 text-white"
          } !h-[25px] !px-2 !outline !outline-1 !py-0 !mr-2 !my-auto leading-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className} !rounded-full`}
        >
          {!enablePublishingFlow && (postObject?.status == POST_STATUSES.PENDING)
            ? "Revert to Draft"
            : !enablePublishingFlow &&
              postObject?.status == POST_STATUSES.PUBLISHED
            ? "Unpublish"
            : !enablePublishingFlow
            ? "Publish"
            : // if there's a draft version different from the content, and post is not published
            postObject?.status == POST_STATUSES.PENDING
            ? "Submit changes"
            : postObject?.status == POST_STATUSES.PUBLISHED
            ? "Publish changes"
            : "Submit"}
        </button>
      </DialogTrigger>
      <DialogContentLarge variant="big">
        <div>
          <DialogTitle>
            {(!enablePublishingFlow && postObject?.status == POST_STATUSES.PENDING)
              ? modalText.revert.title
              : (!enablePublishingFlow && postObject?.status == POST_STATUSES.PUBLISHED)
              ? modalText.revert.title
              : (!enablePublishingFlow && postObject?.status == POST_STATUSES.DRAFT)
                ? modalText.publish.title
              : modalText.submit.title}
          </DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              {(!enablePublishingFlow && postObject?.status == POST_STATUSES.PENDING)
                ? modalText.revert.description
                : (!enablePublishingFlow && postObject?.status == POST_STATUSES.PUBLISHED)
                ? modalText.revert.description
                : (!enablePublishingFlow && postObject?.status == POST_STATUSES.DRAFT)
                  ? modalText.publish.description
                : modalText.submit.description}
            </p>
          </DialogDescription>
        </div>

        <div className="flex flex-row justify-start gap-2">
          <Button
            className={`${modalText.submit.buttonClassName} [disabled]:!opacity-50 [disabled]:!cursor-not-allowed`}
            onClick={onSubmit}
            disabled={submitting}
            variant="confirm"
          >
            {submitting ? (
              <Spinner size="sm" className="mx-auto p-1 cursor-loading " />
            ) : (!enablePublishingFlow && postObject?.status == POST_STATUSES.PENDING) ? (
              modalText.revert.button
            ) : (!enablePublishingFlow && postObject?.status == POST_STATUSES.PUBLISHED) ? (
              modalText.unpublish.button
            ) : (!enablePublishingFlow && (postObject?.status == POST_STATUSES.DRAFT || postObject?.status == null || postObject?.status == undefined)) ? (
              modalText.publish.button
            ) : (!enablePublishingFlow && postObject?.status == POST_STATUSES.PUBLISHED) ? (
              "Publish changes"
            ) : (
              "Submit"
            )}
          </Button>

          <DialogClose asChild>
            <Button variant="gray">Cancel</Button>
          </DialogClose>
        </div>
        <DialogClose asChild>
          <IconButton aria-label="Close">
            <Cross2Icon />
          </IconButton>
        </DialogClose>
      </DialogContentLarge>
    </Dialog>
  );
};
