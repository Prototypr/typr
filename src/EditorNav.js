import React from "react";

// import Link from "next/link";
// import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";

import NavigationMenu from "./Nav/navbar-menu";

// import NavigationMenuMobile from "./Nav/navbar-menu-mobile";
import { CustomLink } from "./components/CustomLink";

export default function EditorNav({
  activeNav,
  postStatus,
  postObject,
  enablePublishingFlow,
  tool,
  isInterview,
  user,
  router,
  settings,
  theme,
  POST_STATUSES,
  hasUnsavedChanges,
  signOut,
}) {
  // const { user, isLoading } = useUser({
  //   redirectIfFound: false,
  // });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const [statusComponent, setStatusComponent] = useState(null);
  useEffect(() => {
    // if(enablePublishingFlow === false){
    //   return; // Just return without any value
    // }
    if (postObject?.status == POST_STATUSES.DRAFT) {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-gray-300 bg-opacity-20 text-gray-500 rounded-full border border-gray-300">
          Draft
        </div>
      );
    } else if (postObject?.status == POST_STATUSES.PENDING) {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-yellow-300 bg-opacity-20 text-yellow-600 rounded-full border border-yellow-300">
          Pending Review
        </div>
      );
    } else if (postObject?.status == POST_STATUSES.PUBLISHED) {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-green-400 bg-opacity-20 text-green-700 rounded-full border border-green-500">
          Published
        </div>
      );
    } else {
      setStatusComponent(null);
    }
  }, [postObject?.status]);

  return (
    <div
      id="main-nav"
      as="nav"
      className={`z-40  ${isInterview ? "w-[calc(100vw-450px)]" : "w-full"} ${
        settings?.nav?.position == "sticky"
          ? "sticky -mb-[64px]"
          : settings?.nav?.position == "fixed"
          ? "fixed"
          : "relative -mb-[64px]"
      } top-0 bg-white/90 backdrop-blur-xs py-3`}
    >
      <>
        <div
          className={`mx-auto text-sm px-2 rounded-xl ${
            isInterview ? "!max-w-full" : "max-w-[1000px]"
          }`}
        >
          <div
            className={` transition transition-all duration-700 ease-in-out relative flex items-center justify-between h-10`}
          >
            {/* <!-- Mobile menu button--> */}
            {/* <div className="sm:hidden absolute inset-y-0 left-0 flex items-center">
              <button
                onClick={toggleMobileNav}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>

                {mobileNavOpen ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div> */}
            <div className="flex-1 flex items-center justify-start sm:items-stretch sm:justify-start">
              {settings?.nav?.logo?.image && settings?.nav?.logo?.show ? (
                <CustomLink
                  href={settings?.nav?.logo?.url}
                  as={settings?.nav?.logo?.url}
                >
                  <div
                    className={`flex-shrink-0  flex items-center cursor-pointer transition transition-all duration-300 ease-in-out`}
                  >
                    <img
                      className="lg:block h-8 w-auto"
                      data-gumlet="false"
                      src={settings?.nav?.logo?.image}
                      alt="Prototypr Logo"
                    />
                  </div>
                </CustomLink>
              ) : (
                <svg
                  className={`${
                    settings?.nav?.logo?.show
                      ? "h-6 my-auto mr-2 w-auto"
                      : "hidden"
                  }`}
                  width="164"
                  height="164"
                  viewBox="0 0 164 164"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_1_12)">
                    <rect width="164" height="164" fill="white" />
                    <rect
                      x="6"
                      y="6"
                      width="152"
                      height="152"
                      rx="6"
                      stroke="black"
                      stroke-width="12"
                    />
                    <path
                      d="M111.138 45.058L89.022 45.446V121.688L104.736 124.986C104.736 128.995 103.637 131 101.438 131L82.62 129.836L63.414 131C60.9567 131 59.728 128.995 59.728 124.986L75.442 121.688V45.446L53.52 45.058L51.58 58.638C51.58 60.578 48.9933 61.548 43.82 61.548L41.88 38.656C42.1387 36.9747 44.0787 36.134 47.7 36.134L82.62 36.91L116.958 36.134C120.579 36.134 122.519 36.9747 122.778 38.656L120.838 61.548C115.665 61.548 113.078 60.578 113.078 58.638L111.138 45.058Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1_12">
                      <rect width="164" height="164" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )}
              {tool ? (
                <div className="my-auto ml-3">
                  <div className="p-2 py-0.5 text-xs bg-pink-100 text-pink-900 rounded-full border border-pink-200">
                    Interview
                  </div>
                </div>
              ) : null}
              {settings.nav.postStatus.show ? (
                <div className="my-auto ml-3">{statusComponent}</div>
              ) : null}
              {/* Undo/redo */}
              <div className={``} id="undoredo-container"></div>
              {settings.nav.unsavedChangesNotice.show &&
              hasUnsavedChanges &&
              !enablePublishingFlow ? (
                <div className="my-auto text-xs my-auto text-gray-400 ml-3">
                  Unsaved changes
                </div>
              ) : null}
            </div>
            <div
              className={`relative block sm:ml-6 transition transition-all duration-500 ease-in-out`}
            >
              <div className="flex ">
                <div
                  className="my-auto flex fixed bottom-0 left-0 p-3 w-full bg-white/90 backdrop-blur-xs sm:bg-none sm:w-fit sm:relative"
                  id="editor-nav-buttons"
                ></div>

                <NavigationMenu
                  showWriteButton={false}
                  showSponsorButton={false}
                  showJobsButton={false}
                  hideLocaleSwitcher={true}
                  user={user}
                  userLoading={false}
                  activeNav={activeNav}
                  editor={true}
                  router={router}
                  settings={settings}
                  theme={theme}
                  signOut={signOut}
                />
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Mobile menu, show/hide based on menu state. --> */}
        {/* <div
          className={`sm:hidden relative ${
            !mobileNavOpen ? "h-0 overflow-hidden" : ""
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavigationMenuMobile
              router={router}
              user={user}
              userLoggedInCookie={userLoggedInCookie}
              userLoading={false}
              activeNav={activeNav}
            />
          </div>
        </div> */}
      </>
    </div>
  );
}
