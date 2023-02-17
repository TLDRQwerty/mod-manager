import { useState } from "react";
import Dialog from "./Dialog";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function Image(props: Props): JSX.Element {
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
        <img {...props} className={"w-full h-full aspect-auto"} />
      </Dialog>
      <img
        onClick={() => {
          setOpen(true);
        }}
        {...props}
      />
    </>
  );
}
