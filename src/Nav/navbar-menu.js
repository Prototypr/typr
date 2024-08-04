import React from "react";
import { styled } from "./stitches.config";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import Button from "../Primitives/Button";

import { CustomLink } from "../components/CustomLink";
// import { useState, useEffect } from "react";


// import { useIntl } from "react-intl";
import UserMenu from "./UserMenu";

const StyledMenu = styled(NavigationMenuPrimitive.Root, {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  width: "auto",
  zIndex: 1,
});

const StyledList = styled(NavigationMenuPrimitive.List, {
  all: "unset",
  display: "flex",
  justifyContent: "center",
  // backgroundColor: 'white',
  padding: 4,
  borderRadius: 6,
  listStyle: "none",
});

// Exports
const NavigationMenu = StyledMenu;
const NavigationMenuList = StyledList;
const NavigationMenuItem = NavigationMenuPrimitive.Item;

export const NavigationMenuDemo = ({
  collapsed,
  user,
  userLoading,
  hideLocaleSwitcher,
  editor,
  showWriteButton,
  showSponsorButton,
  showJobsButton,
  router,
  settings
}) => {
  // const intl = useIntl();
  // const title3 = intl.formatMessage({ id: "navbar.menu.title3" });

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* {!hideLocaleSwitcher && <LocaleSwitcher collapsed={collapsed} />} */}

        {!user || !user?.isLoggedIn ? (
          <NavigationMenuItem
            className={`hidden mr-3 md:block ${
              !collapsed ? "md:opacity-0 md:flex md:invisible" : "md:flex"
            } md:flex-col md:justify-center`}
          >
            {/* {!hideLocaleSwitcher &&  <NavigationMenuLink href="/post/write-for-us">
            {title3}
          </NavigationMenuLink>} */}
          </NavigationMenuItem>
        ) : (
          user &&
          !editor &&
          showWriteButton !== false && (
            <NavigationMenuItem
              className={`hidden mr-2 ml-4 md:block md:flex md:flex-col md:justify-center`}
            >
              <CustomLink href="/write">
                <Button className="flex" type="" variant="confirmRounded">
                  <svg
                    className="w-4 h-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z"
                      fill="currentColor"
                    />
                  </svg>
                  Write
                </Button>
              </CustomLink>
            </NavigationMenuItem>
          )
        )}
        {user && !editor && showSponsorButton == true && (
          <NavigationMenuItem
            className={`hidden mr-2 ml-4 md:block md:flex md:flex-col md:justify-center`}
          >
            <CustomLink href="/sponsor">
              <Button className="flex" type="" variant="confirmRounded">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z"
                    fill="currentColor"
                  />
                </svg>
                Create Ad
              </Button>
            </CustomLink>
          </NavigationMenuItem>
        )}
        {user && !editor && showJobsButton == true && (
          <NavigationMenuItem
            className={`hidden mr-2 ml-4 md:block md:flex md:flex-col md:justify-center`}
          >
            <CustomLink href="/sponsor">
              <Button className="flex" type="" variant="confirmRounded">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z"
                    fill="currentColor"
                  />
                </svg>
                Post job
              </Button>
            </CustomLink>
          </NavigationMenuItem>
        )}
          {settings.nav.userBadge.show ? <NavigationMenuItem className="flex flex-col justify-center">
            {user ? (
                <UserMenu router={router} user={user} settings={settings?.nav.userBadge} /> 
            ) : userLoading ? (
              <div className="bg-gray-200 hover:shadow border border-1 ml-2 rounded-full my-auto w-8 h-8 cursor-pointer"></div>
            ) : (
              null
            )}
          </NavigationMenuItem>:null}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationMenuDemo;
