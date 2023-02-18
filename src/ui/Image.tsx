import clsx from "clsx";
import { useState } from "react";
import Dialog from "./Dialog";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function Image({ className, ...rest }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog
        size="7xl"
        open={open}
        padding={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <img {...rest} className={"w-full h-full aspect-auto"} />
      </Dialog>
      <img
        onClick={() => {
          setOpen(true);
        }}
        className={clsx(className, "cursor-pointer")}
        {...rest}
      />
    </>
  );
}
