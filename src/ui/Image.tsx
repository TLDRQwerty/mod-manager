import clsx from "clsx";
import { useState } from "react";
import { TbMinimize } from "react-icons/tb";
import Dialog from "./Dialog";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function Image({ className, ...rest }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog
        size="6xl"
        open={open}
        padding={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <TbMinimize
          className="absolute top-0 right-0 m-4 h-6 w-6 cursor-pointer rounded bg-white text-black hover:bg-gray-300"
          onClick={() => {
            setOpen(false);
          }}
        />
        <img {...rest} className={"aspect-auto h-full w-full"} />
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
