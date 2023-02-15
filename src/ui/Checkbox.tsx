import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Checkbox({ ...props }: Props): JSX.Element {
  return (
    <input
      type="checkbox"
      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-indigo-500"
      {...props}
    />
  );
}
