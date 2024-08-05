"use client";

import React, { useState, useEffect } from 'react';


import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogContentLarge,
  DialogTitle,
  DialogDescription,
  DialogClose,
  IconButton,
} from "./Primitives/Dialog";
import Button from "./Primitives/Button";
import Spinner from "./atom/Spinner/Spinner";

export const PublishDialogButton = ({ onSave, canPublish, postObject,theme }) => {
  const [submitting, setSubmitting] = useState();
  const [submitOpen, setSubmitOpen] = useState();

  const onSubmit = async () => {
    setSubmitting(true);
    onSave({ forReview: true });
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

  const disabled = !canPublish ||
  ( (
     (postObject.status == "pending" ||
     postObject.status == "publish") &&
     (postObject?.draft_content?.length == 0 ||
       (postObject?.draft_content?.length > 0 &&
         postObject?.content == postObject?.draft_content))) 
         &&
         
         ((postObject.status == "pending" ||
           postObject.status == "publish") &&
           (postObject?.draft_title?.length == 0 ||
             (postObject?.draft_title?.length > 0 &&
               postObject?.title == postObject?.draft_title))))


  return (
    <Dialog onOpenChange={toggleSubmitOpen} open={submitOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          variant="confirmRounded"
          className={`!text-[13px] !font-normal rounded-full ${theme=='blue'?'bg-blue-600 hover:bg-blue-500 !outline-blue-600':'bg-gray-600 hover:bg-gray-500 !outline-gray-600'}  text-white !h-[25px] !px-2 !outline !outline-1 !py-0 !mr-2 !my-auto ${disabled?'opacity-50 cursor-not-allowed':''}`}
        >
          {
            // if there's a draft version different from the content, and post is not published
            postObject.status == "pending"
              ? "Submit changes"
              : postObject.status == "publish"
                ? "Publish changes"
                : "Submit"
          }
        </button>
      </DialogTrigger>
      <DialogContentLarge variant="big">
        <div>
          <DialogTitle>
            {postObject?.status == "pending"
              ? "Update submission"
              : postObject?.status == "publish"
                ? "Save and Publish"
                : "Submit for Review"}
          </DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              {postObject.status == "pending"
                ? `You have made changes to your story. Update your submission with your latest changes for Prototypr editors to review.`
                : postObject.status == "publish"
                  ? `You have made changes to your story. Publish your changes to make them live.`
                  : `Your story will be submitted to our publication editors for
              review. The editors will review your draft and publish it within 1
              week if it fits our guidelines, or get back to you with feedback.`}
            </p>
            {postObject.status !== "pending" &&
            postObject.status !== "publish" ? (
              <p className="mb-4">
                Readers will not see your story in the publication until it is
                reviewed and published by our editors. Feel free to continue
                editing even after submitting.
              </p>
            ) : null}
          </DialogDescription>
        </div>

        <div className="flex flex-row justify-start gap-2">
          <Button onClick={onSubmit} disabled={submitting} variant="confirm">
            {submitting ? (
              <Spinner size="sm" className="mx-auto p-1 cursor-loading " />
            ) : postObject.status == "publish" ? (
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
