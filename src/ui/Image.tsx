import clsx from "clsx";
import { useState } from "react";
import { TbCross, TbMinimize } from "react-icons/tb";
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
        <TbMinimize
          className="absolute top-0 right-0 cursor-pointer bg-white rounded text-black m-4 h-6 w-6"
          onClick={() => {
            setOpen(false);
          }}
        />
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
