import React from 'react';

import Link from "next/link";
import dynamic from "next/dynamic";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import jsCookie from "js-cookie";

const NavigationMenuDemo = dynamic(() => import("./Nav/navbar-menu"), {
  ssr: true,
});
const NavigationMenuMobile = dynamic(() => import("./Nav/navbar-menu-mobile"), {
  ssr: false,
});

export default function EditorNav({ activeNav, postStatus,navLogo, tool, post, isInterview, user, mutateUser, primaryColor }) {
  // const { user, isLoading } = useUser({
  //   redirectIfFound: false,
  // });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  /**
   * use the logged in true/false cookie
   * so there is minimal flicker between subscribe and log in button
   */
  const [userLoggedInCookie] = useState(() => {
    let loggedInCookie = jsCookie.get("prototypr-loggedIn");
    if (loggedInCookie == "true") {
      return true;
    } else {
      return false;
    }
  });

  useEffect(() => {
    if (user?.email) {
      jsCookie.set("prototypr-loggedIn", true);
    } else {
      jsCookie.set("prototypr-loggedIn", false);
    }
  }, [user?.email]);

  const [statusComponent, setStatusComponent] = useState(null);
  useEffect(() => {
    if (postStatus == "draft") {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-gray-300 bg-opacity-20 text-gray-500 rounded-full border border-gray-300">
          Draft
        </div>
      );
    }
    if (postStatus == "pending") {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-yellow-300 bg-opacity-20 text-yellow-600 rounded-full border border-yellow-300">
          Pending Review
        </div>
      );
    }
    if (postStatus == "publish") {
      setStatusComponent(
        <div className="p-2 py-0.5 text-xs bg-green-400 bg-opacity-20 text-green-700 rounded-full border border-green-500">
          Published
        </div>
      );
    }
  }, [postStatus]);

  return (
    <div id="main-nav" as="nav" className={`z-40  ${isInterview ? "fixed w-[calc(100vw-450px)]" : "fixed w-full"}  bg-white/90 backdrop-blur-xs py-3 top-0`}>
      <>
        <div className={`mx-auto text-sm px-2 rounded-xl ${isInterview ? "!max-w-full" : "max-w-[1000px]"}`}>
          <div
            className={` transition transition-all duration-700 ease-in-out relative flex items-center justify-between h-10`}
          >
            <div className="sm:hidden absolute inset-y-0 left-0 flex items-center">
              {/* <!-- Mobile menu button--> */}
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
            </div>
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              {navLogo?<Link href="/" as="/">
                <div
                  className={`flex-shrink-0  flex items-center cursor-pointer transition transition-all duration-300 ease-in-out`}
                >
                  <img
                    className="lg:block h-8 w-auto"
                    data-gumlet="false"
                    src={navLogo}
                    alt="Prototypr Logo"
                  />
                </div>
              </Link>:<svg className="h-6 my-auto mr-2 w-auto" width="164" height="164" viewBox="0 0 164 164" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_12)">
<rect width="164" height="164" fill="white"/>
<rect x="6" y="6" width="152" height="152" rx="6" stroke="black" stroke-width="12"/>
<path d="M111.138 45.058L89.022 45.446V121.688L104.736 124.986C104.736 128.995 103.637 131 101.438 131L82.62 129.836L63.414 131C60.9567 131 59.728 128.995 59.728 124.986L75.442 121.688V45.446L53.52 45.058L51.58 58.638C51.58 60.578 48.9933 61.548 43.82 61.548L41.88 38.656C42.1387 36.9747 44.0787 36.134 47.7 36.134L82.62 36.91L116.958 36.134C120.579 36.134 122.519 36.9747 122.778 38.656L120.838 61.548C115.665 61.548 113.078 60.578 113.078 58.638L111.138 45.058Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_1_12">
<rect width="164" height="164" fill="white"/>
</clipPath>
</defs>
</svg>



}
              {tool ? (
                <div className="my-auto ml-3">
                  <div className="p-2 py-0.5 text-xs bg-pink-100 text-pink-900 rounded-full border border-pink-200">
                    Interview
                  </div>
                </div>
              ) : null}
              <div className="my-auto ml-3">{statusComponent}</div>
              {/* Undo/redo */}
              <div id="undoredo-container"></div>
            </div>
            <div
              className={`hidden sm:block sm:ml-6 transition transition-all duration-500 ease-in-out`}
            >
              <div className="flex ">
                {/* {editorButtons} */}
                <div
                  className="my-auto flex mr-3"
                  id="editor-nav-buttons"
                ></div>

                <NavigationMenuDemo
                  showWriteButton={false}
                  showSponsorButton={false}
                  showJobsButton={false}
                  hideLocaleSwitcher={true}
                  user={user}
                  userLoading={false}
                  userLoggedInCookie={userLoggedInCookie}
                  activeNav={activeNav}
                  editor={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Mobile menu, show/hide based on menu state. --> */}
        <div
          className={`sm:hidden relative ${
            !mobileNavOpen ? "h-0 overflow-hidden" : ""
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavigationMenuMobile
              user={user}
              userLoggedInCookie={userLoggedInCookie}
              userLoading={false}
              activeNav={activeNav}
            />
          </div>
        </div>
      </>
   
    </div>
  );
}
