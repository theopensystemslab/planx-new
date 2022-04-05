import React from "react";

import OptionButton from "./OptionButton";

interface RadioProps<T> {
  value?: T;
  options: Array<{ label: string; value: T }>;
  onChange: (newValue: T) => void;
}

export default function Radio<T>(props: RadioProps<T>) {
  return (
    <div>
      {props.options.map((option, index) => (
        <OptionButton
          selected={props.value === option.value}
          key={index}
          onClick={() => {
            props.onChange(option.value);
          }}
        >
          {option.label}
        </OptionButton>
      ))}
    </div>
  );
}
