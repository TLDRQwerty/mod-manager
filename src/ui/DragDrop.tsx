import { DragEventHandler } from "react";
import { open } from "@tauri-apps/api/dialog";

interface Props {
  onDrop: DragEventHandler<HTMLDivElement>;
  onFilesPicked?: (filePath: string[]) => void;
  className?: string;
}

export function DragDrop({
  onDrop,
  className,
  onFilesPicked,
}: Props): JSX.Element {
  const onClick = async (): Promise<void> => {
    if (onFilesPicked == null) {
      return;
    }

    const filePaths = await open({
      multiple: true,
    });

    if (filePaths != null) {
      onFilesPicked(Array.isArray(filePaths) ? filePaths : [filePaths]);
    }
  };

  return (
    <div
      onClick={onFilesPicked != null ? onClick : undefined}
      onDrop={onDrop}
      className={className}
    />
  );
}
