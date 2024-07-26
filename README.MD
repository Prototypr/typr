# Prototypr Editor

This is the editor from the core prototypr-frontend package. 

I just started splitting it out, so there's still work to do before it becomes usable.

The goal is to make it easy to drop into any React project.


install with 
`npm install --legacy-peer-deps`

## Local development

Clone the folder `prototypr-packages/typr` and run `npm install`

### Linking to another project
If developing locally, you can link the package to the root of the prototypr-frontend repo to be able to see the changes you make in the editor.

1. First, in your prototypr-packages/typr directory, run:
`npm link`

This creates a symlink in the global node_modules folder.
2. Then, in your prototypr-frontend (or any project) directory, run:
`npm link @prototypr/typr`

This will create a symlink from the global link to your local project's node_modules/@prototypr/typr.

Now, your prototypr-frontend project will use the local version of @prototypr/typr.

if you want to switch back to the npm version before pushing, you can unlink and reinstall:
`npm unlink @prototypr/typr`
`npm install @prototypr/typr`


### Watch script
Use watch script in package.json in typr to automatically rebuild on changes:

run `npm run watch` in the typr directory while developing.

### Publish updates

to publish updates run `npm run publish-update`

Note: This script assumes you're already logged in to npm (npm login) and have the necessary permissions to publish the package. It also assumes you have git set up and have permission to push to the repository.
