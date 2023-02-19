import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Checkbox({ ...props }: Props): JSX.Element {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-indigo-500"
      {...props}
    />
  );
}
