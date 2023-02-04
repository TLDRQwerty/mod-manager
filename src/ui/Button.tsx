import { forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default forwardRef<HTMLButtonElement, Props>(function Button(
  { ...rest },
  ref
) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      ref={ref}
      {...rest}
    />
  );
});
