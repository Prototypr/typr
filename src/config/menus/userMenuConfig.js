import React from "react";

import { UserCircle, Article, InfoIcon, OctocatLogo, HandHeart } from "../../icons/icons";
export const loggedInMenu = {
    show:true,
    items: [
      {
        link: '#',
        icon: <UserCircle size={26} className="opacity-80 mr-3" />,
        label: "Profile",
      },
      { separator: true },
      {
        link: "#",
        icon: <Article size={26} className="opacity-80 mr-3" />,
        label: "Posts",
      }
    ],
    adminMenu: [
      { separator: true },
      {
        link: "#",
        label: "👩‍✈️ Admin",
      },
    ]
  }


export const loggedOutMenuItems = [
  // {
  //   link: `#`,
  //   icon: <InfoIcon size={26} className="opacity-80 mr-3" />,
  //   label: "About Typr",
  // },
  {
    link: `https://github.com/prototypr/typr`,
    icon: <OctocatLogo size={26} className="opacity-80 mr-3" />,
    label: "Star on GitHub",
  },
  {
    link: `https://github.com/sponsors/prototypr`,
    icon: <HandHeart size={26} className="opacity-80 mr-3" />,
    label: "Sponsor us"
  }

]