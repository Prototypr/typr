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

export const PublishChangesDialog = ({
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
      title: "Publish changes",
      description:
        "Your post has been updated. Publish your changes to make them live.",
      button: "Publish",
    },
  };

  const onSubmit = async () => {
    setSubmitting(true);
    forceSave({ publish: true, editor: editor });

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
    !canPublish 

  return (
    <Dialog onOpenChange={toggleSubmitOpen} open={submitOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          variant="confirmRounded"
          className={`!text-[13px] !font-normal rounded-full ${
            theme == "blue"
              ? "bg-blue-600 hover:bg-blue-500 !outline-blue-600 text-white"
              : "bg-gray-600 hover:bg-gray-500 !outline-gray-600 text-white"
          } !h-[25px] !px-2 !outline !outline-1 !py-0 !mr-2 !my-auto leading-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className} !rounded-full`}
        >
          Publish changes
        </button>
      </DialogTrigger>
      <DialogContentLarge variant="big">
        <div>
          <DialogTitle>{modalText.publish.title}</DialogTitle>
          <DialogDescription>
            <p className="mb-4">{modalText.publish.description}</p>
          </DialogDescription>
        </div>

        <div className="flex flex-row justify-start gap-2">
          <Button
            className={`${
              theme == "blue"
                ? "!bg-blue-600 !hover:bg-blue-500 !outline-blue-600"
                : "!bg-gray-600 !hover:bg-gray-500 !outline-gray-600"
            } [disabled]:!opacity-50 [disabled]:!cursor-not-allowed !text-white !rounded-full !leading-none`}
            style={{lineHeight: "inherit"}}
            onClick={onSubmit}
            disabled={submitting}
            variant="confirm"
          >
            {submitting ? (
              <Spinner size="sm" className="mx-auto p-1 cursor-loading " />
            ) : (
              "Publish changes"
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
