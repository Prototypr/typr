import {loggedInMenu, loggedOutMenuItems} from "./menus/userMenuConfig";

export const defaultProps = {
  requireLogin: true,
  theme: {
    primaryColor: null,
  },
  components: {
    nav: {
      show: true,
      logo: { image: null, url: "/", show: true },
      undoRedoButtons: { show: true },
      userBadge: {
        show: true,
        avatarPlaceholder: "https://avatar.iran.liara.run/public",
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
  },
  user: {
    id: null,
    jwt: null,
    slug: null,
    avatar: "https://avatar.iran.liara.run/public",
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
    create: () => {},
    save: () => {},
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
