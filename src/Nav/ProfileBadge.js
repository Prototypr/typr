"use client";
import React from "react";
import { keyframes } from "@stitches/react";
import { styled } from "./stitches.config";
import { blue, mauve, blackA, gray, green } from "@radix-ui/colors";
import { signOut } from "next-auth/react";
import fetchJson from "../utils/fetchJson";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: 220,
  backgroundColor: "white",
  borderRadius: 6,
  padding: 5,
  boxShadow:
    "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const itemStyles = {
  all: "unset",
  fontSize: 15,
  lineHeight: 1,
  color: blackA,
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  height: 36,
  padding: "0 5px",
  position: "relative",
  paddingLeft: 25,
  paddingRight: 25,
  userSelect: "none",

  "&[data-disabled]": {
    color: mauve.mauve8,
    pointerEvents: "none",
  },

  "&:focus": {
    backgroundColor: blue.blue11,
    color: blue.blue1,
  },
};

const itemBannerStyles = {
  all: "unset",
  fontSize: 15,
  lineHeight: 1,
  color: blackA,
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  width: "300px",
  height: "auto",
  padding: "0 0px",
  position: "relative",
  paddingLeft: 0,
  userSelect: "none",
  backgroundColor: green.green2,
  "&[data-disabled]": {
    color: mauve.mauve8,
    pointerEvents: "none",
  },

  "&:focus": {
    backgroundColor: blue.blue11,
    color: blue.blue1,
  },
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });
const StyledItemBanner = styled(DropdownMenuPrimitive.Item, {
  ...itemBannerStyles,
});
const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, {
  ...itemStyles,
});
const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem, {
  ...itemStyles,
});
const StyledTriggerItem = styled(DropdownMenuPrimitive.Trigger, {
  '&[data-state="open"]': {
    backgroundColor: blue.blue4,
    color: blue.blue11,
  },
  ...itemStyles,
});

const StyledLabel = styled(DropdownMenuPrimitive.Label, {
  paddingLeft: 25,
  fontSize: 12,
  lineHeight: "25px",
  color: mauve.mauve11,
  borderRadius: "4px",
});

const StyledSeparator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: gray.gray4,
  margin: 5,
});

const StyledItemIndicator = styled(DropdownMenuPrimitive.ItemIndicator, {
  position: "absolute",
  left: 0,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: "white",
});

// Exports
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = StyledContent;
export const DropdownMenuItem = StyledItem;
export const DropdownMenuItemBanner = StyledItemBanner;
export const DropdownMenuCheckboxItem = StyledCheckboxItem;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = StyledRadioItem;
export const DropdownMenuItemIndicator = StyledItemIndicator;
export const DropdownMenuTriggerItem = StyledTriggerItem;
export const DropdownMenuLabel = StyledLabel;
export const DropdownMenuSeparator = StyledSeparator;
export const DropdownMenuArrow = StyledArrow;

// Your app...
const Box = styled("div", {});

const IconButton = styled("button", {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "100%",
  height: 35,
  width: 35,
  color: blue.blue11,
  backgroundColor: "white",
  border: `1px solid ${gray.gray3}`,
  "&:hover": { backgroundColor: blue.blue3 },
  "&:focus": { boxShadow: `0 0 0 2px ${blue.blue7}` },
});

const renderMenuItems = (items, user, router) => {
  return items.map((item, index) => {
    if (item.separator) {
      return <DropdownMenuSeparator key={`separator-${index}`} />;
    }

    if (item.condition && !item.condition(user)) {
      return null;
    }

    if (item.items) {
      return renderMenuItems(item.items, user, router);
    }

    return (
      <DropdownMenuItem
        key={item.label}
        onSelect={() => {
          if (typeof item.link === "function") {
            router.push(item.link(user));
          } else {
            router.push(item.link);
          }
        }}
      >
        {item.icon}
        {item.label}
      </DropdownMenuItem>
    );
  });
};

export const ProfileBadgeDropdown = ({
  icon,
  user,
  mutateUser,
  router,
  settings
}) => {
  return (
    <Box>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton aria-label="Customise options" className="!rounded-full">
            {icon}
          </IconButton>
        </DropdownMenuTrigger>

        <DropdownMenuPrimitive.DropdownMenuPortal
          container={
            typeof document !== "undefined" &&
            document?.getElementById("main-nav")
          }
        >
          <DropdownMenuContent
            side={"bottom"}
            align={"center"}
            // alignOffset={-10}
            avoidCollisions={true}
            // sideOffset={-36}
          >
            {user?.isLoggedIn ? renderMenuItems(settings.loggedInMenu.items, user, router) : renderMenuItems(settings.loggedOutMenu.items, user, router)}

            {/* <DropdownMenuSeparator /> */}

            {/* <DropdownMenuItemBanner
              onSelect={() => {
                router.push(`/web-monetization`);
              }}
            >
              <div className="p-3 rounded-lg flex">
                <div className="flex flex-col justify-start mr-2 w-20">
                  <img
                    className="w-20 "
                    src="https://webmonetization.org/img/wm-icon-animated.svg"
                  />
                </div>
                <div>
                  <h2 className="text-md font-primary font-medium mb-1">
                    Learn Web Monetization
                  </h2>
                  <p className="text-sm opacity-70">
                    Receive streamed payments and tips on your articles.
                  </p>
                </div>
              </div>
            </DropdownMenuItemBanner> */}

            {/* <DropdownMenuItem
              onSelect={() => {
                router.push("/write");
              }}
            >
              Write a Post
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}

            {(user?.isLoggedIn && user?.isAdmin) &&
              renderMenuItems(settings.loggedInMenu.adminMenu, user, router)}

            {(user?.isLoggedIn && user?.profile?.companies?.length) &&
              renderMenuItems(settings.loggedInMenu.businessMenu, user, router)}

            <DropdownMenuSeparator />
            {(user?.isLoggedIn) ? <DropdownMenuItem
              onSelect={async () => {
                await signOut({ redirect: false });
                mutateUser(
                  await fetchJson("/api/auth/logout", { method: "POST" }),
                  false
                );
              }}
            >
              Sign out
            </DropdownMenuItem>:
            <DropdownMenuItem
              onSelect={() => {
                router.push("/login");
              }}
            >
              Sign in
            </DropdownMenuItem>
            }

            <DropdownMenuArrow offset={12} />
          </DropdownMenuContent>
        </DropdownMenuPrimitive.DropdownMenuPortal>
      </DropdownMenu>
    </Box>
  );
};

export default ProfileBadgeDropdown;
