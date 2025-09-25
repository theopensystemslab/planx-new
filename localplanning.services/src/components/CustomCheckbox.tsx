import React from "react";

type CustomCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  disabled?: boolean;
  className?: string;
};

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  count,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`govuk-checkboxes__item relative ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="govuk-checkboxes__input absolute opacity-0 w-9 h-9 cursor-pointer z-10 disabled:cursor-not-allowed outline-none"
      />
      <label 
        htmlFor={id}
        className={`govuk-checkboxes__label flex items-start gap-4 cursor-pointer min-h-[36px] relative pl-12 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span 
          className={`govuk-checkboxes__indicator absolute left-0 top-0 w-9 h-9 border-3 border-gray-900 bg-white block transition-all duration-150 ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          {checked && (
            <span 
              className="absolute block"
              style={{
                top: "7px",
                left: "6px",
                width: "18px",
                height: "11px",
                transform: "rotate(-45deg)",
                border: "solid",
                borderWidth: "0 0 4px 4px",
                borderColor: "#000",
                borderTopColor: "transparent"
              }}
            />
          )}
        </span>

        <span className="text-body-lg mb-0 mt-1">
          {label}
          {count !== undefined && (
            <span className="text-gray-600 text-body-md ml-1 mb-0">({count})</span>
          )}
        </span>
      </label>
    </div>
  );
};
