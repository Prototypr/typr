import React from 'react';

export const getInterViewTemplate = ({ productName }) => {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: `${productName}: Creator Story`,
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "italic",
              },
            ],
            text: "Welcome to your creator story! This is an interview template that will help share your story and show the human behind the product. The purpose is to showcase work you're excited about, whilst also helping and inspiring readers with their own projects. On completion, your story will be featured on Prototypr and shared with our 25k+ newsletter subscribers and 100k+ Medium followers. ",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [
                      {
                        type: "italic",
                      },
                    ],
                    text: "Add your responses under the headings marked with Q.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [
                      {
                        type: "italic",
                      },
                    ],
                    text: "Feel free to add your own questions to steer the article ",
                  },
                ],
              },
              {
                type: "paragraph",
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [
                      {
                        type: "italic",
                      },
                    ],
                    text: "Long answers are encouraged, we will scope it down where needed when editing the submission",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [
                      {
                        type: "italic",
                      },
                    ],
                    text: "Add pictures and videos (this editor is still WIP, so add links to videos if they don't upload)",
                  },
                ],
              },
              {
                type: "paragraph",
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [
              {
                type: "italic",
              },
            ],
            text: "Once completed, submit it for review, and we'll work with you to turn it into a piece ",
          },
          {
            type: "text",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://prototypr.io/post/framer-sites-building-landing-pages-that-tell-stories-with-olvy",
                  target: "_blank",
                  rel: null,
                  class: null,
                },
              },
              {
                type: "italic",
              },
            ],
            text: "like this one",
          },
          {
            type: "text",
            marks: [
              {
                type: "italic",
              },
            ],
            text: " or ",
          },
          {
            type: "text",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://prototypr.io/post/from-design-system-to-nft-design-system-creating-tinyfaces",
                  target: "_blank",
                  rel: null,
                  class: null,
                },
              },
              {
                type: "italic",
              },
            ],
            text: "this one",
          },
          {
            type: "text",
            marks: [
              {
                type: "italic",
              },
            ],
            text: ". ",
          },
        ],
      },
      {
        type: "horizontalRule",
      }
    ],
  };
};
