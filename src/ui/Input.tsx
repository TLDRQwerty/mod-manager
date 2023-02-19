import { forwardRef, InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export default forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return (
    <input
      className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      {...props}
      ref={ref}
    />
  );
});
