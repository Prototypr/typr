import React from 'react'
// Custom deep merge function
export function customDeepMerge(target, source) {
    if (typeof source !== "object" || source === null) {
      return source;
    }
  
    const output = Array.isArray(target) ? [] : {};
  
    if (Array.isArray(target) && Array.isArray(source)) {
      return source;
    }
  
    Object.keys({ ...target, ...source }).forEach(key => {
      if (key in target) {
        if (
          typeof source[key] === "object" &&
          !React.isValidElement(source[key])
        ) {
          output[key] = customDeepMerge(target[key], source[key]);
        } else if (source[key] !== undefined) {
          output[key] = source[key];
        } else {
          output[key] = target[key];
        }
      } else if (source[key] !== undefined) {
        output[key] = source[key];
      }
    });
  
    return output;
  }