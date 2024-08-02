import React from "react";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { indigo } from "@radix-ui/colors";
import { styled } from "@stitches/react";
import NextLink from "next/link";

const itemButtonStyles = {
    padding: "8px 12px",
    outline: "none",
    userSelect: "none",
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 4,
    fontSize: 15,
    marginLeft: "6px",
    color: gray.gray1,
    "&:focus": { position: "relative", boxShadow: `0 0 0 2px ${indigo.indigo8}` },
    "&:hover": { backgroundColor: indigo.indigo9, color: gray.gray1 },
  };

  
  const StyledButton = styled(NavigationMenuPrimitive.Link, {
    ...itemButtonStyles,
    display: "block",
    background: indigo.indigo10,
    textDecoration: "none",
    fontSize: 15,
    lineHeight: 1,
  });
  

const CustomButton = ({ href, children, props }) => {
    if (NextLink) {
        return (
          <NextLink href={href} passHref>
            <StyledButton asChild>
              <span style={props.css} {...props}>
                {children}
              </span>
            </StyledButton>
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

export default CustomButton;