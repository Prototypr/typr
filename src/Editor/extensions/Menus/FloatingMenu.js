import React, { useState, useEffect, useRef } from "react";
import { FloatingMenu } from "@tiptap/react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  ImageIcon,
  DividerIcon,
  PlusIcon,
  MinusIcon,
  YouTubeIcon,
  XIcon,
  CodeIcon,
} from "../../../icons/icons";

import { ImageDecorationKey } from "../CustomExtensions/Figure2/CustomImage";

function findPlaceholder(state, id) {
  let decos = ImageDecorationKey.getState(state);
  let found = decos.find(null, null, spec => spec.id == id);
  return found.length ? found[0].from : null;
}

let id = {};

const removePlaceholder = editor => {
  let placeholderPos = findPlaceholder(editor.state, id);
  // If the content around the placeholder has been deleted, drop
  // the image
  if (placeholderPos !== null) {
    const { view } = editor;

    view.dispatch(
      view.state.tr.setMeta(ImageDecorationKey.key, {
        remove: { id },
      })
    );
  }
};

const addPlaceholder = (blob, editor, type) => {
  // A fresh object to act as the ID for this upload
  id = {};

  let pos = editor.state.selection;

  let imgSrc = URL.createObjectURL(blob);
  if (pos.from) {
    editor
      .chain()
      .focus()
      .insertContentAt(pos, '<p class="is-empty"></p>', {
        updateSelection: true,
      })
      .run();

    const { view } = editor;
    // Replace the selection with a placeholder
    let tr = view.state.tr;
    tr.setMeta(ImageDecorationKey.key, {
      add: {
        id,
        pos: pos.from - 1,
        src: imgSrc,
        width: 200,
        height: 200,
        type: "png",
      },
    });

    view.dispatch(tr);

    return pos.from - 1;
  }
};

//function to check if the file is an image or a video:
const isImage = file => {
  return file && file["type"].split("/")[0] === "image";
};

const isVideo = file => {
  return file && file["type"].split("/")[0] === "video";
};

const uploadMedia = (event, editor, user, setLoading, setIsOpen, mediaHandler) => {
  const files = event.target.files;

  //if image
  if (files && files[0] && isImage(files[0])) {
    if (files && files[0]) {
      var reader = new FileReader();

      reader.onload = async e => {
        setLoading(true);
        const url = e.target.result;

        const resp = await fetch(url);
        const blob = await resp.blob();
        setIsOpen(false);
        let placeholderPos = addPlaceholder(blob, editor);

        const file = new File([blob], `${files[0].name || "image.png"}`, {
          type: "image/png",
        });

        const data = new FormData();
        data.append("files", file);


        const configUpload = mediaHandler?.config;
        if(!configUpload) {
          toast.error("Media Handler not found.", {
            duration: 5000,
          });
          return;
        };
        configUpload.data = data;

        await axios(configUpload)
          .then(async function (response) {
            setLoading(false);
            setIsOpen(false);
            toast.success("Image Uploaded!", {
              duration: 5000,
            });
            const url = response?.data?.url;
            // editor.chain().focus().setFigure({src: url, caption:'enter caption'}).run()
            // editor.chain().focus().setImage({ src: url }).run();
            editor
              .chain()
              .setNodeSelection(placeholderPos)
              .setFigure({
                figureType: "image",
                position: placeholderPos,
                src: url,
                alt: "",
                figcaption: "",
                class: "",
              })
              .run();
            removePlaceholder(editor);
          })
          .catch(function (error) {
            console.log(error);
            setIsOpen(false);
            alert("There was an issue with that image. Please try again.");
            setTimeout(() => {}, 300);
            removePlaceholder(editor);
          });
      };
      reader.readAsDataURL(files[0]);
    }
  }
  //if video
  else if (files && files[0] && isVideo(files[0])) {
    if (files && files[0]) {
      var reader = new FileReader();

      reader.onload = async e => {
        setLoading(true);
        const url = e.target.result;

        const resp = await fetch(url);
        const blob = await resp.blob();

        let placeholderPos = addPlaceholder(blob, editor);

        const file = new File([blob], `${files[0].name || "video.mp4"}`, {
          type: "video/mp4",
        });

        const data = new FormData();
        data.append("files", file);

        // var configUpload = {
        //   method: "post",
        //   url: `${process.env.NEXT_PUBLIC_API_URL}/api/users-permissions/users/article/image/upload`,
        //   headers: {
        //     Authorization: `Bearer ${user?.jwt}`,
        //   },
        //   data: data,
        // };
        const configUpload = mediaHandler?.config;
        if(!configUpload) {
          toast.error("Media Handler not found.", {
            duration: 5000,
          });
          return;
        };
        configUpload.data = data;

        await axios(configUpload)
          .then(async function (response) {
            setLoading(false);
            toast.success("Video Uploaded!", {
              duration: 5000,
            });
            let url = response?.data?.url;

            // const gumletData = await uploadToGumlet({
            //   videoUrl: url,
            //   mediaId: null,
            // });

            // const gumletAttr = {
            //   gumletId: gumletData.asset_id,
            //   source_id: gumletData.source_id,
            //   collection_id: gumletData.collection_id,
            //   output: gumletData?.output,
            // };

            //ensure url has https:// prefix
            if (!url.startsWith("https://")) {
              url = "https://" + url;
            }

            // editor.chain().focus().setFigure({src: url, caption:'enter caption'}).run()
            // editor.chain().focus().setImage({ src: url }).run();
            editor.commands.setFigure({
              figureType: "video",
              position: placeholderPos,
              // gumlet: JSON.stringify(gumletAttr),
              src: url,
              original: url,
              class: "",
            });
            removePlaceholder(editor);
          })
          .catch(function (error) {
            console.log(error);
            alert("There was an issue with that video. Please try again.");
            setTimeout(() => {}, 300);
            removePlaceholder(editor);
          });
      };
      reader.readAsDataURL(files[0]);
    }
  }
};

const MenuFloating = ({ editor, isSelecting, user, mediaHandler }) => {
  const [loading, setLoading] = useState(false);
  const [open, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(!open);
  };

  useEffect(() => {
    let editor = document.querySelector(".tiptap.ProseMirror");
    if (open) {
      editor?.classList?.add("menu-open");
    } else {
      editor?.classList?.remove("menu-open");
    }
  }, [open]);

  useEffect(() => {
    function handleKeyUp(event) {
      setIsOpen(false);
    }

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <FloatingMenu
      shouldShow={({ editor, view, state, oldState }) => {
        if (state?.selection?.$anchor?.parent?.type?.name == "doc") {
          setIsOpen(false);
          return false;
        }

        if (
          state?.selection?.$anchor?.parent?.type?.name == "paragraph" &&
          state?.selection?.$anchor?.parent?.textContent == "" &&
          !editor?.isActive("bulletList") &&
          !editor?.isActive("orderedList")
        ) {
          return true;
        }

        if (
          editor?.state?.doc?.textContent?.trim() === "" &&
          state?.selection?.$anchor?.pos == 2
        ) {
          return true;
        }
      }}
      editor={editor}
      tippyOptions={{ duration: 100 }}
    >
      <div
        id="menu-trigger-container"
        className="relative z-20 w-[50px] -ml-[72px]"
      >
        <button
          ref={triggerRef}
          onClick={toggleOpen}
          className={`${open?'rotate-45':''} transition-all duration-300 hover:cursor-pointer bg-white border-gray-900 text-black-900 rounded-full w-[35px] h-[35px] border-gray-900 flex items-center justify-center border`}
          aria-label="Menu"
        >
          <PlusIcon size={22} />
        </button>
        {open && (
          <div
            ref={menuRef}
            className="absolute left-full top-0 ml-2 rounded-md p-0 flex flex-row gap-2.5 menu-items-container"
            style={{ minWidth: '200px' }}
          >
            <button className="menu-item bg-white w-[35px] h-[35px] border-gray-900 flex items-center justify-center border rounded-full">
              <label
                htmlFor="img-upload"
                className="w-full h-full flex cursor-pointer custom-file-upload"
              >
                <ImageIcon size={22} className="my-auto mx-auto" />
              </label>
              <input
                type="file"
                id="img-upload"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) => {
                  setIsOpen(false);
                  uploadMedia(event, editor, user, setLoading, setIsOpen, mediaHandler);
                }}
              />
            </button>
            <button
              onClick={() => {
                editor.chain().insertTweet().run();
              }}
              className="menu-item bg-white w-[35px] h-[35px] border-gray-900 flex items-center justify-center border rounded-full"
              aria-label="Insert Tweet"
            >
              <XIcon size={22} />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                const url = prompt("Enter YouTube URL");
                if (url) {
                  let pos = editor.state.selection.from;
                  editor
                    .chain()
                    .setYoutubeVideo({
                      src: url,
                      width: 600,
                      height: 400,
                    })
                    .setNodeSelection(pos - 1)
                    .insertContentAt(pos, "<p></p>")
                    .setTextSelection(pos + 1)
                    .focus()
                    .enter()
                    .run();
                }
              }}
              className="menu-item bg-white w-[35px] h-[35px] border-gray-900 flex items-center justify-center border rounded-full"
              aria-label="Insert YouTube Video"
            >
              <YouTubeIcon size={22} />
            </button>
            <button
              onClick={() => {
                editor.chain().focus().setCodeBlock().run();
              }}
              className="menu-item bg-white w-[35px] h-[35px] border-gray-900 flex items-center justify-center border rounded-full"
              aria-label="Insert Code Block"
            >
              <CodeIcon size={22} />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => {
                  editor
                    .chain()
                    .focus()
                    .setHorizontalRule()
                    .setHardBreak()
                    .run();
                }, 20);
              }}
              className="menu-item bg-white w-[35px] h-[35px] border-gray-900 flex items-center justify-center border rounded-full"
              aria-label="Insert Divider"
            >
              <MinusIcon size={22} />
            </button>
          </div>
        )}
      </div>
    </FloatingMenu>
  );
};

export default MenuFloating;