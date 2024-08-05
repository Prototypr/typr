import { loggedInMenu, loggedOutMenuItems } from "./menus/userMenuConfig";
import { settingsMenu, seoMenu } from "./menus/settingsMenuConfig";

const avatars = [
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/32a56359cbe6a680ac1eb8eb659c46eb.png",
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/0a9496997fadf7fe4b3abf75d9028896.png",
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/1176b8d1f12fda27c573679c1e087696.png",
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/878477ec11de77f246d4227b69872004.png",
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/87f42d2905ca067a0e19fdd59ca660e7.png",
  "https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/081acfb7b35bb30672282a0ca01d76a7.png",
];

export const defaultProps = {
  requireLogin: true,
  theme: "gray",
  components: {
    nav: {
      show: true,
      logo: { image: null, url: "/", show: true },
      undoRedoButtons: { show: true },
      userBadge: {
        show: true,
        avatarPlaceholder: avatars[Math.floor(Math.random() * 6)],
        loggedInMenu: loggedInMenu,
        loggedOutMenu: {
          button: {
            show: false,
            label: "Login",
            url: "/login",
          },
          items: loggedOutMenuItems,
        },
      },
      undoRedoButtons: {
        show: true,
      },
      postStatus: {
        show: true,
      },
    },
    settingsPanel: {
      show: true,
      generalTab: {
        menu: settingsMenu
      },
      seoTab: {
        menu: seoMenu
      },
      featuredImage: {
        show: false,
      },
    },
  },
  user: {
    id: null,
    jwt: null,
    slug: null,
    avatar: null,
    loading: false,
    isLoggedIn: false,
    isAdmin: false,
    mutate: () => {
      console.log("mutate user");
      return false;
    },
  },
  postOperations: {
    load: () => {},
    // create: () => {},
    create: false,
    // save: () => {},
    save:false,
    saveSettings: () => {}
  },
  hooks: {
    onPostCreated: ({ id }) => {
      console.log(`Post created with id: ${id}`);
    },
  },
  router: {
    push: url => {
      if (typeof window !== "undefined" && typeof url === "string") {
        window.location.href = url;
      }
    },
  },
  childProps: {},
  isInterview: false,
  tool: false,
};
