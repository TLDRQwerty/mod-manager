import { forwardRef, InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export default forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  return (
    <input
      className="border p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      {...props}
      ref={ref}
    />
  );
});
