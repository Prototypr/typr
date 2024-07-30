# Prototypr Editor

This is the editor from the core prototypr-frontend package.

I just started splitting it out, so there's still work to do before it becomes usable.

The goal is to make it easy to drop into any React project.

install with
`npm install --legacy-peer-deps`

## Example usage

It is not yet ready for use in other projects, as the data fetching is still kind of hardcoded to work with Prototypr!

At the moment, I am importing the `EditorWrapper` component (ssr: false):

```
const EditorWrapper = dynamic(() => import("tiptypr/dist/EditorWrapper"), {
  ssr: false
});
```

Then importing it to the react project with hooks specific to Prototypr:

```
<EditorWrapper
    user={user}
    userLoading={isLoading}
    mutateUser={mutateUser}
    getUserArticle={getUserArticle}
    getSlugFromArticleId={getSlugFromArticleId}
    />
```

The CSS compiles, and you could import it like this:
```
import 'tiptypr/dist/styles.css';
```
but if you already have tailwind installed, it's better to use your own tailwind config to import the styles:
```
  content: [
    "./node_modules/tiptypr/dist/**/*.{js,ts,jsx,tsx}",
  ],
```

Next job is to remove the hardcoded dependencies on how data is loaded and saved.
Maybe make it so it can all just work using localStorage.

## Local development

Clone the folder `prototypr-packages/typr` and run `npm install`

### Watch script

Use watch script in package.json in typr to automatically rebuild on changes:

run `npm run watch` in the typr directory while developing.
