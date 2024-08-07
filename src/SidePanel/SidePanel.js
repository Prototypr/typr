import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Portal } from "react-portal";
import { Cross2Icon } from "@radix-ui/react-icons";
import ImageUploader from "./ImageUploader";
import * as Tabs from "@radix-ui/react-tabs";
import FormField from "./FormField/FormField";

const SidePanel = ({
  isOpen,
  close,
  editor,
  postObject,
  refetchPost,
  user,
  updatePostSettings,
  settingsPanelSettings,
  settingsOptions,
  theme,
}) => {
  const [rootElement] = useState(() => document.querySelector(`body`));

  return (
    <SidebarInner
      isOpen={isOpen}
      postObject={postObject}
      close={close}
      isAdmin={user?.isAdmin}
      user={user}
      rootElement={rootElement}
      editor={editor}
      refetchPost={refetchPost}
      updatePostSettings={updatePostSettings}
      settingsPanelSettings={settingsPanelSettings}
      settingsOptions={settingsOptions}
      theme={theme}
    />
  );
};

export default React.memo(SidePanel);
// export default SidePanel

const SidebarInner = ({
  isOpen,
  close,
  rootElement,
  editor,
  isAdmin,
  postObject,
  user,
  refetchPost,
  updatePostSettings,
  settingsPanelSettings,
  settingsOptions,
  theme,
}) => {
  const [coverImage, setCoverImage] = useState(null);
  
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("seo");

  const [showSeoPanel, setShowSeoPanel] = useState(true);
  const [showGeneralPanel, setShowGeneralPanel] = useState(true);

  const [updatedSettingsOptions, setUpdatedSettingsOptions] = useState(settingsOptions);

  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (tabName, fieldIndex, newValue) => {
    setUpdatedSettingsOptions(prevOptions => {
      const newOptions = {
        ...prevOptions,
        [tabName]: prevOptions[tabName].map((field, index) =>
          index === fieldIndex ? { ...field, initialValue: newValue } : field
        )
      };
      
      // Check if there are any changes
      const hasAnyChanges = Object.keys(newOptions).some(tab =>
        newOptions[tab].some((field, index) => 
          field.initialValue !== settingsOptions[tab][index].initialValue
        )
      );
      
      setHasChanges(hasAnyChanges);
      return newOptions;
    });
  };

  useEffect(() => {
    const isAllAdminOnly = (options) => options.every(option => option.adminOnly);

    if (!user?.isAdmin) {
      const seoOptions = settingsOptions?.seo || [];
      const generalOptions = settingsOptions?.general || [];

      setShowSeoPanel(!isAllAdminOnly(seoOptions));
      setShowGeneralPanel(!isAllAdminOnly(generalOptions));
    }
  }, [settingsOptions, user]);

  useEffect(() => {
    if (postObject?.featuredImage) {
      setCoverImage(postObject?.featuredImage);
    } else {
      const json = editor.getJSON();
      if (!coverImage && json) {
        let content = json?.content;
        let cover = content?.find(p => p?.type === "figure")?.attrs?.src;
        setCoverImage(cover);
      }
    }
  }, [isOpen && editor]);

  // Add this new useEffect hook
  useEffect(() => {
    if (postObject) {
      setUpdatedSettingsOptions(prevOptions => {
        const newOptions = { ...prevOptions };
        Object.keys(newOptions).forEach(tabName => {
          newOptions[tabName] = newOptions[tabName].map(field => {
            const fieldParts = field.field.split('.');
            let value = postObject;
            for (const part of fieldParts) {
              value = value?.[part];
              if (value === undefined) break;
            }
            return { ...field, initialValue: value !== undefined ? value : field.initialValue };
          });
        });
        return newOptions;
      });
    }
  }, [postObject]);

  const updatePost = async () => {
    setSaving(true);
    const settings = {};

    Object.keys(updatedSettingsOptions).forEach(tabName => {
      updatedSettingsOptions[tabName].forEach((field, index) => {
        const originalField = settingsOptions[tabName][index];
        if (originalField && field.initialValue !== originalField.initialValue) {
          // Handle dot notation in field names
          const fieldParts = field.field.split('.');
          let currentObj = settings;
          
          fieldParts.forEach((part, i) => {
            if (i === fieldParts.length - 1) {
              currentObj[part] = field.initialValue;
            } else {
              currentObj[part] = currentObj[part] || {};
              currentObj = currentObj[part];
            }
          });
        }
      });
    });

    if (Object.keys(settings).length > 0) {
      try {
       let updatedData = await updatePostSettings({ settings });
        if(!updatedData){
          throw new Error("Failed to update settings. Please try again.");
        }
        const updatedPost = await refetchPost(); // Assume this returns the updated post data
        
        //this is done in the hook above instead
        // Update the local state with the new settings from the refetched post
        // setUpdatedSettingsOptions(prevOptions => {
        //   const newOptions = { ...prevOptions };
        //   Object.keys(newOptions).forEach(tabName => {
        //     newOptions[tabName] = newOptions[tabName].map(field => {
        //       const fieldParts = field.field.split('.');
        //       let value = updatedPost;
        //       for (const part of fieldParts) {
        //         value = value?.[part];
        //         if (value === undefined) break;
        //       }
        //       return { ...field, initialValue: value !== undefined ? value : field.initialValue };
        //     });
        //   });
        //   return newOptions;
        // });

        setHasChanges(false);
      } catch (error) {
        console.error("Error updating post settings:", error);
        // Re-enable the save button by setting hasChanges back to true
        setHasChanges(true);
        // Optionally, show an error message to the user
        // For example: setErrorMessage("Failed to update settings. Please try again.");
      }
    }
    setSaving(false);
  };

  return (
    <Portal node={rootElement}>
      <motion.div
        initial={"-380px"}
        animate={{
          x: isOpen ? "-400px" : "0px",
          transition: {
            type: "spring",
            damping: 25,
            velocity: 2,
            stiffness: 230,
          },
        }}
        style={{ width: "400px", right: "-405px", paddingRight: "0px" }}
        className="fixed z-[99] top-0"
      >
        <div
          className="h-screen flex flex-col pt-4 bg-white shadow-xl"
          style={{ willChange: "transform" }}
        >
          <div className="px-4 sm:px-6 pb-3 flex justify-between">
            <div className="flex">
              <h2
                id="slide-over-heading"
                className="text-gray-900 text-lg font-semibold"
              >
                {showSeoPanel && showGeneralPanel
                  ? "Story Settings"
                  : showSeoPanel
                  ? "SEO Settings"
                  : "General Settings"}
              </h2>
            </div>

            <div
              onClick={close}
              className="z-50 flex cursor-pointer opacity-75 hover:opacity-100 my-auto mr-2"
            >
              <Cross2Icon />
            </div>
          </div>
          
          {showSeoPanel && showGeneralPanel ? (
            <Tabs.Root
              className="flex flex-col h-full"
              defaultValue={showSeoPanel ? "seo" : "general"}
              onValueChange={value => setActiveTab(value)}
            >
              <Tabs.List className="flex border-b border-t border-gray-200">
                {showSeoPanel && (
                  <Tabs.Trigger
                    className={`flex-1 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none border-b-2 border-transparent ${
                      theme == "blue"
                        ? "data-[state=active]:border-blue-500"
                        : "data-[state=active]:border-gray-500"
                    } data-[state=active]:bg-white data-[state=active]:text-gray-900 transition-all`}
                    value="seo"
                  >
                    SEO
                  </Tabs.Trigger>
                )}
                {showGeneralPanel && (
                  <Tabs.Trigger
                    className={`flex-1 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none border-b-2 border-transparent ${
                      theme == "blue"
                        ? "data-[state=active]:border-blue-500"
                        : "data-[state=active]:border-gray-500"
                    } data-[state=active]:bg-white data-[state=active]:text-gray-900 transition-all`}
                    value="general"
                  >
                    General
                  </Tabs.Trigger>
                )}
              </Tabs.List>
              {showSeoPanel && (
                <Tabs.Content className="flex-grow overflow-auto" value="seo">
                  <div className="mt-6 px-4 sm:px-6">
                    {updatedSettingsOptions?.seo?.map((field, index) => (
                      <FormField
                        key={index}
                        {...field}
                        onValueChange={(newValue) => handleFieldChange('seo', index, newValue)}
                      />
                    ))}
                  </div>
                </Tabs.Content>
              )}
              {showGeneralPanel && (
                <Tabs.Content
                  className="flex-grow overflow-auto pb-[140px]"
                  value="general"
                >
                  <div className="mt-6 px-4 sm:px-6">
                    <div className="bg-white mb-5 border-gray-100">
                      {updatedSettingsOptions?.general?.map(
                        (field, index) => (
                          <FormField
                            key={index}
                            {...field}
                            onValueChange={(newValue) => handleFieldChange('general', index, newValue)}
                          />
                        )
                      )}
                      {settingsPanelSettings.featuredImage?.show == true && (
                        <div className="border border-gray-100 p-4 rounded-md my-3">
                          <h2 className="font-medium text-md mb-4 font-secondary">
                            Featured Image
                          </h2>
                          {postObject?.slug ? (
                            <ImageUploader
                              key={coverImage}
                              borderRadius={6}
                              disallowScale={true}
                              uploadOnInsert={true}
                              placeholderImg={
                                postObject?.featuredImage
                                  ? postObject?.featuredImage
                                  : coverImage
                                  ? coverImage
                                  : "https://s3-us-west-1.amazonaws.com/tinify-bucket/%2Fprototypr%2Ftemp%2F1580577924294-Group+74.png"
                              }
                              height={400}
                              width={400}
                              adaptable={true}
                              postObject={postObject}
                              imageUrl={
                                postObject?.featuredImage
                                  ? postObject?.featuredImage
                                  : coverImage
                                  ? coverImage
                                  : null
                              }
                              setLogoUploadLink={() => {
                                return true;
                              }}
                              center={false}
                              uploadImageAPI={"/api/aws/uploadPublicationLogo"}
                              uploadAPI={`/api/publication/updatePublication`}
                              fieldName="logo"
                              uploadButtonText={"Browse"}
                              filename={`ftImage_${postObject?.id}`}
                              user={user}
                              refetchPost={refetchPost}
                            />
                          ) : (
                            <div className="text-sm text-gray-700">
                              <p className="mb-3">
                                Dear admin, you can only upload a featured image to
                                a post that has already been saved as a draft.
                              </p>
                              <p className="mb-3">
                                Press 'Save Draft', and then come back here to
                                attach a featured image.
                              </p>
                              <p className="mb-3 text-xs text-purple-500">
                                (Todo: make this work for non drafts where the post
                                has not been created yet.)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Tabs.Content>
              )}
            </Tabs.Root>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-grow overflow-auto pb-[140px]">
                <div className="mt-6 px-4 sm:px-6">
                  {showSeoPanel && (
                    <>
                      {updatedSettingsOptions?.seo?.map((field, index) => (
                        <FormField
                          key={index}
                          {...field}
                          onValueChange={(newValue) => handleFieldChange('seo', index, newValue)}
                        />
                      ))}
                    </>
                  )}
                  {showGeneralPanel && (
                    <>
                      <div className="bg-white mb-5 border-gray-100">
                        {updatedSettingsOptions?.general?.map(
                          (field, index) => (
                            <FormField
                              key={index}
                              {...field}
                              onValueChange={(newValue) => handleFieldChange('general', index, newValue)}
                            />
                          )
                        )}
                        {settingsPanelSettings.featuredImage?.show == true && (
                          <div className="border border-gray-100 p-4 rounded-md my-3">
                            <h2 className="font-medium text-md mb-4 font-secondary">
                              Featured Image
                            </h2>
                            {postObject?.slug ? (
                              <ImageUploader
                                key={coverImage}
                                borderRadius={6}
                                disallowScale={true}
                                uploadOnInsert={true}
                                placeholderImg={
                                  postObject?.featuredImage
                                    ? postObject?.featuredImage
                                    : coverImage
                                    ? coverImage
                                    : "https://s3-us-west-1.amazonaws.com/tinify-bucket/%2Fprototypr%2Ftemp%2F1580577924294-Group+74.png"
                                }
                                height={400}
                                width={400}
                                adaptable={true}
                                postObject={postObject}
                                imageUrl={
                                  postObject?.featuredImage
                                    ? postObject?.featuredImage
                                    : coverImage
                                    ? coverImage
                                    : null
                                }
                                setLogoUploadLink={() => {
                                  return true;
                                }}
                                center={false}
                                uploadImageAPI={"/api/aws/uploadPublicationLogo"}
                                uploadAPI={`/api/publication/updatePublication`}
                                fieldName="logo"
                                uploadButtonText={"Browse"}
                                filename={`ftImage_${postObject?.id}`}
                                user={user}
                                refetchPost={refetchPost}
                              />
                            ) : (
                              <div className="text-sm text-gray-700">
                                <p className="mb-3">
                                  Dear admin, you can only upload a featured image to
                                  a post that has already been saved as a draft.
                                </p>
                                <p className="mb-3">
                                  Press 'Save Draft', and then come back here to
                                  attach a featured image.
                                </p>
                                <p className="mb-3 text-xs text-purple-500">
                                  (Todo: make this work for non drafts where the post
                                  has not been created yet.)
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="px-5 flex fixed w-full bg-white bottom-0 justify-start border-t py-3 gap-3 border-gray-300">
            {postObject?.published_at && (
              <button
                className="w-fit px-4 h-[40px] bg-gray-50 hover:bg-gray-100 outline outline-gray-400 outline-1 text-gray-500 font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                variant={"ghostBlue"}
                onClick={() => {
                  window.open(`/post/${postObject.slug}`);
                }}
              >
                View
              </button>
            )}
            <button
              disabled={saving || !hasChanges}
              className={`w-fit px-4 h-[40px] ${
                theme == "blue"
                  ? "bg-blue-600 hover:bg-blue-500  outline-blue-500"
                  : "bg-gray-600 hover:bg-gray-500  outline-gray-500"
              } text-white outline outline-1 font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed`}
              onClick={updatePost}
            >
              Save all
            </button>
          </div>
        </div>
      </motion.div>
    </Portal>
  );
};