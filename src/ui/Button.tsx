import { cva, VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const button = cva("text-white font-bold py-2 px-4 rounded", {
  variants: {
    intent: {
      primary: "bg-blue-500 hover:bg-blue-700",
      secondary: "bg-gray-500 hover:bg-gray-700",
      destructive: "bg-red-500 hover:bg-red-700",
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export default forwardRef<HTMLButtonElement, Props>(function Button(
  { intent, ...rest },
  ref
) {
  return <button className={button({ intent })} ref={ref} {...rest} />;
});
