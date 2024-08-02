import React from "react";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { indigo } from "@radix-ui/colors";
import { styled } from "@stitches/react";

let NextLink = null;
try {
  NextLink = require("next/link").default;
} catch (error) {
  console.warn("NextLink is not installed");
}
const itemStyles = {
    padding: "8px 12px",
    outline: "none",
    userSelect: "none",
    fontWeight: 400,
    lineHeight: 1,
    borderRadius: 4,
    fontSize: 15,
    "&:focus": { position: "relative", boxShadow: `0 0 0 2px ${indigo.indigo8}` },
    "&:hover": { backgroundColor: indigo.indigo3, color: indigo.indigo11 },
  };

  
const StyledLink = styled(NavigationMenuPrimitive.Link, {
    ...itemStyles,
    display: "block",
    textDecoration: "none",
    fontSize: 15,
    lineHeight: 1,
  });

const CustomNavLink = ({ href, children, props }) => {
    if (NextLink) {
        return (
          <NextLink href={href} passHref>
            <StyledLink asChild>
              <span style={props.css} {...props}>
                {children}
              </span>
            </StyledLink>
          </NextLink>
        );
      } else {
        return (
          <a href={href} style={props.css} {...props}>
            {children}
          </a>
        );
      }
};

export const CustomLink = ({ href, children }) => {
    if(NextLink) {
        return <NextLink href={href}>{children}</NextLink>;
    }else{
        return <a href={href}>{children}</a>;
    }
};

export default CustomNavLink;