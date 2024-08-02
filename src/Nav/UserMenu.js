import React from "react";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { CustomLink } from "../components/CustomLink";
import Button from "../Primitives/Button";
import NewPostDialog from "./NewPostDialog";
import ProfileBadge from "./ProfileBadge";
// Exports
const NavigationMenuItem = NavigationMenuPrimitive.Item;

const UserMenu = ({ user, userLoading, sessionUser, navigate }) => {
  return (
    <>
      {true ? (
        <NavigationMenuItem
          className="flex flex-col justify-center"
          style={{ zIndex: 999 }}
        >
          {(user && user?.isLoggedIn) || sessionUser ? (
            <div className="w-8 mt-[4px] mr-1.5">
              {(user || sessionUser) && (
                <ProfileBadge
                  navigate={navigate}
                  user={user}
                  icon={
                    <img
                      className="hover:shadow border border-1 !rounded-full my-auto w-full h-full cursor-pointer object-cover"
                      src={
                        user?.profile?.avatar?.url
                          ? user.profile?.avatar.url
                          : "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/4f9713374ad556ff3b8ca33e241f6c43.png?updated_at=2022-12-14T10:55:38.818Z"
                      }
                    />
                  }
                />
              )}
            </div>
          ) : userLoading && !sessionUser ? (
            <div className="bg-gray-200 hover:shadow border border-1 ml-2 rounded-full my-auto w-8 h-8 cursor-pointer"></div>
          ) : (
            <div className="hidden lg:flex">
              {/* <Link className="my-auto" href="/onboard?signin=true">
                <div className="flex cursor-pointer text-gray-700 text-sm mr-4">
                  <div className="my-auto font-medium">Log in</div>
                </div>
              </Link> */}
              <CustomLink href="/onboard">
                <Button
                  className="text-sm bg-blue-600 hover:bg-blue-500 rounded-xl"
                  variant={"confirmRounded"}
                >
                  Sign in
                </Button>
              </CustomLink>
            </div>
            // <NewsletterNav collapsed={false} />
          )}
        </NavigationMenuItem>
      ) : (
        <NewPostDialog />
      )}
    </>
  );
};

export default UserMenu;
