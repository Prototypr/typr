# Typr Editor

Typr is a Medium-like editor for React that integrates with your user system and CMS. It handles content loading, creation, and auto-saving out of the box. Add your user data and database props to get a fully functional editor with draft and publishing workflows.

`npm install tiptypr`

[Try the demo here](https://typr-editor-demo.vercel.app/demo) - customize the editor, and get a copy/pastable component with config.

<a href="https://typr-editor-demo.vercel.app/demo"><img src="https://prototypr-media.sfo2.digitaloceanspaces.com/strapi/af968e21ccb808a0a57c4a7827a44237.png"/></a>

Typr was built with Tiptap for [Prototypr](https://prototypr.io) (so the npm package is called 'tiptypr'). I separated it to a standalone package to help streamline the process of adding an editing experience with publishing and autosaving to any React project.

It's currently live in use on [Prototypr](https://prototypr.io), a platform built with Strapi and Next.js, but it can be used with any Content Management System:

---

## Built for any CMS

Typr editor is designed to seamlessly integrate with React projects (e.g. Next.js applications).
The editor is built to work with any CMS backend, allowing users to publish content to various systems such as WordPress, Strapi, or your custom CMS solution.
It's a headless editor that lets users publish to your CMS without requiring direct access to your backend admin dashboard.

If you need assistance adapting Typr to work better with your CMS, consider [sponsoring the project](https://github.com/sponsors/Prototypr). Your support can help drive further development and customization.

---

### Key Features

- React Editor: Easily embed Typr in your React or Next.js projects.
- Universal CMS Compatibility: Works with any CMS backend such a Strapi, Wordpress and custom CMS solutions.
- Publish Workflow: Configurable draft/pending/publish workflow (useful for publishers who want to review content before publishing):
  - Save as draft/pending/publish
  - If post status is publish or pending, require confirmation before overwriting published version
- Customizable UI: Offers a customizable user menu dropdown and editor navigation to match your application's design.
- Configurable Fields: You can configure the settings panel to work with any fields in your CMS.
- Admin only fields: You can hide fields from the settings panel, and the editor, if you want to use Typr as a content manager.

---

## Save modes

There's 2 publishing modes:

- **Standard mode** (draft/publish): This is a more standard save mode, where the post status is set to draft by default, and the user can publish it themselves at any time. The content is saved to local storage, but you must press the save button to save changes. (todo add autosave for this mode)

- **Publisher Flow** (draft/pending/publish): This mode is for publishing platforms where content needs to be reviewed by editors before publishing. There is a submit button for users to submit their content for review, which will set the post status to pending. An editor can then review the content and publish it, and its status will be set to publish. Publisher flow autosaves as you type.
  - To use the publisher flow, you also gotta provide `versioned_title` and `versioned_content` properties in your post object.

To enable the publisher flow, set `enablePublishingFlow={true}`.

---

## Example usage

Install the package, then import it along with the styles to your project ([see the demo project for examples](https://github.com/Prototypr/typr-editor-demo)):

```
import Tiptypr from "tiptypr";
import { useTypr } from "tiptypr";

import "tiptypr/dist/styles.css";
```

If you already have tailwind installed on your project, you can also add the following to your tailwind config instead of importing the styles:

```
  content: [
    "./node_modules/tiptypr/dist/**/*.{js,ts,jsx,tsx}",
  ],
```

Then add the component to your app with the props you need to customise.. Here is an example:
⚠️ Docs in progress - I need to add all the available props and explain how to use them.
🎉 Aug 28 2024 update - Now the editor is a hook, and works just like Tiptap editor, also giving you access to the underlying Tiptap editor instance with `typr.editor` - this lets you use the editor like a normal Tiptap editor, but with added features like autosaving and publishing flows.

```
    const typr = useTypr({
      requireLogin: editorProps.requireLogin,
      components: editorProps.components,
      theme: editorProps.theme,
      user: editorProps.user,
      enablePublishingFlow: editorProps.enablePublishingFlow,
      customPostStatuses: editorProps.customPostStatuses,
      postId: postId, // Update to use postId state
      postOperations: {
        load: async function ({ postId }) {
          const postObject = await loadPostById(parseInt(postId, 10));
          console.log("loaded", postObject);
          return postObject;
        },
        save: async function ({ postId, entry }) {
          console.log("saving entry", entry);
          const postObject = await savePost(
            entry,
            parseInt(postId, 10)
          );
          fetchData();
          return postObject;
        },
        create: async function ({ entry }) {
          console.log("creating post", entry);
          const postObject = await createPost(entry);
          fetchData();
          return postObject;
        },
      },
      hooks: {
        onPostCreated: ({ id }) => {
          const params = new URLSearchParams(searchParams);
          params.set("id", id);
          router.push(`?${params.toString()}`, undefined, {
            shallow: true,
            scroll: false,
          });
        },
      },
    });

    return (
     <Tiptypr
      typr={typr}
      onReady={({editor})=>{
        //setEditorInstance(editor)
      }}
    />
    )
```

There was a demo [on here to get your props](https://typr-editor-demo.vercel.app/demo), but it needs updating to use the new hook editor.

### Access the underlying Tiptap editor instance

The hook editor returns the Tiptap instance, so you can use it to insert content into the editor like this:

```
const {typr} = useTypr({...editorProps});

typr.editor.commands.insertContent('Hello');
```

### Using the hook editor

Here's how you can use the hook editor to perform various actions and access the editor state:

- Publish a post:
  ```javascript
  const { typr } = useTypr({...editorProps});
  typr.publish();
  ```

- Unpublish a post:
  ```javascript
  const { typr } = useTypr({...editorProps});
  typr.unpublish();
  ```

- Save a post:
  ```javascript
  const { typr } = useTypr({...editorProps});
  typr.save();
  ```

- Access the editor state:
  ```javascript
  const { typr } = useTypr({...editorProps});
  const { hasUnsavedChanges, saving, saved } = typr;
  ```

You can use these states to create your own custom buttons or UI elements


---

## Required Props

If you're saving, loading, and creating posts in a CMS, you'll need to pass the following props:

- postId: (put an ID **set it to -1 if your post is loading** - otherwise it creates a new post)
- user
- postOperations
  - load (must return `title` and `content`)
  - save
  - create
- router (push command)

The way you get these depends on your own setup, here's each one:

### postId

Usually when you're editing a post, you'll have the ID in the URL. For a next app, you can just use `router.query.id` or `router.query.slug`. For example:

`postId={router?.isReady && (router.query.slug || router.query.id)}`

### user

user is the current user object. For Prototypr, I have a `useUser` hook within the component I am importing the Typr editor, and pass that as the prop.

The user object should include the following attributes:

- id
- avatar (url)
- isLoggedIn
- isAdmin

### postOperations

Each postOperation must return a postObject that has an `id`, `title`, `content`, and `status` attribute.

If you're using the publishing flow (with `enablePublishingFlow={true}`), you also need to provide `versioned_title` and `versioned_content`

postOperations is an object that includes the following functions:

- load
- save
- create

#### postOperations.load

This is where you load the post from your CMS. It must return the `id`, `title`, `content`, and `status` for the editor, plus any other attributes you want to use.
I just add an imported function to it:

```
postOperations={{
        load:async({postId, user})=>{
            const postObject = await getUserArticle({postId, user})
            return postObject;
          },
        }}
```

Which loads the article from my Strapi backend and returns the entire post object, including the required title and content -e.g.

```
postObject = {
  title: 'My first post',
  content: '<p>This is my first post</p>',
  published: true,
  publishedAt: '2022-01-01',
  author: 'John Doe',
  slug: 'my-first-post',
  id: '123',
  status: 'published',
  publishedAt: '2022-01-01',
  updatedAt: '2022-01-01',
}
```

#### postOperations.save

This is where you save your post to your CMS. This function is called by Typr when autosaving.

It will call your save function with the following arguments:

- entry
- postId

Your function should return the saved post object, or false if the save failed.
The returned postObject should have a `title`, `content`, and `status` attribute.

```
save:async ({ entry, postId }) => {
            const postObject = await savePost({ entry, postId, user });
            return postObject;
          },
```

#### postOperations.create

This is where you create a new post in your CMS.

```
create:async ({ entry }) => {
            const postObject = await createPost({ entry, user });
            return postObject;
          }
```

## mediaHandler

You can add a config object to the mediaHandler prop to handle image uploads.

Example:

```
mediaHandler:{
    config: {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/users-permissions/users/article/image/upload`,
      headers: {
        Authorization: `Bearer ${user?.jwt}`,
      }
    },
  },
```

A file is created and appended to a form data object, which is sent to the url provided in the config provided like this:

```
const file = new File([blob], `${files[0].name || "image.png"}`, {
  type: "image/png",
});

const data = new FormData();
data.append("files", file);

const configUpload = mediaHandler?.config;
configUpload.data = data;

await axios(configUpload)
  .then(async function (response) {
    toast.success("Image Uploaded!", {...
```

---

## ⚠️ Docs in progress!

These docs are still in progress, and the project still needs testing.

### Todo:

- [ ] Save featured image in settings
- [ ] Link embed needs api route to get embed data

## Local development

Clone the folder `typr` and run `npm install`

### Watch script

Use watch script in package.json in typr to automatically rebuild on changes:

run `npm run watch` in the typr directory while developing.
