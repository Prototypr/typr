import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Select from '@radix-ui/react-select';
import { styled } from "@stitches/react";
import { slate, indigo } from "@radix-ui/colors";
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { CheckIcon } from '@radix-ui/react-icons';
import { parseISO, isValid } from 'date-fns';

const inputStyles = {
  all: "unset",
  flex: "1 0 auto",
  borderRadius: 4,
  padding: "0 10px",
  fontSize: 15,
  lineHeight: 1,
  color: slate.slate12,
  boxShadow: `0 0 0 1px ${slate.slate8}`,
  backgroundColor: indigo.indogo9,
  height: 35,
  "&:focus": { boxShadow: `0 0 0 2px ${slate.slate8}` },
  width: "80%",
};

const Input = styled("input", inputStyles);

const TextArea = styled("textarea", {
  ...inputStyles,
  height: 100,
  padding: "10px",
  resize: "vertical",
});

const FormField = ({ type, label, initialValue, onValueChange, description, options }) => {
    const [value, setValue] = useState(initialValue);
  
    useEffect(() => {
      if (type === 'date' && initialValue) {
        const parsedDate = parseISO(initialValue);
        setValue(isValid(parsedDate) ? initialValue : null);
      } else {
        setValue(initialValue);
      }
    }, [initialValue, type]);
  
    const handleChange = (newValue) => {
      setValue(newValue);
      onValueChange(type === 'date' ? newValue.toISOString() : newValue);
    };
  
    switch (type) {
      case 'text':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3">
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <Input
              onChange={(e) => handleChange(e.target.value)}
              value={value}
            />
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      case 'description':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3">
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <TextArea
              onChange={(e) => handleChange(e.target.value)}
              value={value}
              className="!leading-normal"
            />
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      case 'number':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3">
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <Input
              type="number"
              onChange={(e) => handleChange(e.target.value)}
              value={value}
            />
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      case 'date':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3">
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <ReactDatePicker
              selected={value && isValid(parseISO(value)) ? parseISO(value) : null}
              onChange={(date) => handleChange(date)}
              customInput={<Input />}
            />
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      case 'url':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3">
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <Input
              type="url"
              onChange={(e) => handleChange(e.target.value)}
              value={value}
              placeholder="https://example.com"
            />
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      case 'select':
        return (
          <div className="border border-gray-100 p-4 rounded-md my-3" >
            <h2 className="font-medium text-md mb-4 font-secondary">{label}</h2>
            <Select.Root value={value} onValueChange={handleChange}>
              <Select.Trigger className="inline-flex items-center justify-between w-[80%] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Select.Value placeholder="Select an option" />
                <Select.Icon>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg" style={{ zIndex: 9999 }}>
                  <Select.Viewport className="p-1">
                    {options?.length > 0 && options.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className="relative flex items-center px-8 py-2 text-sm text-gray-900 cursor-default select-none hover:bg-gray-100"
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            {description && <p className="mt-3 text-xs text-gray-400">{description}</p>}
          </div>
        );
      //   case 'image':
      //     return (
      //       <div className="border border-gray-100 p-4 rounded-md my-3">
      //         <h2 className="font-medium text-md mb-2 font-secondary">{label}</h2>
      //         <p className="text-sm mb-4">{description}</p>
      //         <ImageField
      //           value={value}
      //           onChange={(imageUrl) => handleChange(imageUrl)}
      //         />
      //       </div>
      //     );
      // Add more cases for other field types as needed
      default:
        return null;
    }
  };

  export default FormField;