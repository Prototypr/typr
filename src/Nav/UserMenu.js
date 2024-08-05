import React from "react";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { CustomLink } from "../components/CustomLink";
import Button from "../Primitives/Button";
import ProfileBadge from "./ProfileBadge";

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const UserMenu = ({ user, router, settings }) => {
  return (
    <>
        <NavigationMenuItem
          className="flex flex-col justify-center"
          style={{ zIndex: 999 }}
        >
          {((settings.loggedOutMenu  && settings.loggedOutMenu.button.show==false)|| user?.isLoggedIn) ? (
            <div className="w-8 mt-[4px] mr-1.5 ml-1">
              {(user) && (
                <ProfileBadge
                router={router}
                settings={settings}
                  user={user}
                  icon={
                    <img
                      className="hover:shadow border border-1 !rounded-full my-auto w-full h-full cursor-pointer object-contain"
                      src={
                        user?.avatar
                          ? user.avatar
                          : settings?.avatarPlaceholder?settings?.avatarPlaceholder:"https://avatar.iran.liara.run/public"
                      }
                    />
                  }
                />
              )}
            </div>
          ): (
            <>
            {settings?.nav?.userBadge?.show ? <div className="hidden lg:flex">
              <CustomLink href="/onboard">
                <Button
                  className={`text-[13px] !h-[25px] !px-2 bg-blue-600 hover:bg-blue-500 rounded-xl`}
                  variant={"confirmRounded"}
                >
                  Sign in
                </Button>
              </CustomLink>
            </div> : ""}
            </>
          )}
        </NavigationMenuItem>
    </>
  );
};

export default UserMenu;
