import { DragEventHandler, useState } from "react";
import { open } from "@tauri-apps/api/dialog";

interface Props {
  onDrop: DragEventHandler<HTMLDivElement>;
  onFilesPicked?: (filePath: string[]) => void;
  className?: string;
}

export function DragDrop({
  onDrop,
  className = "",
  onFilesPicked,
}: Props): JSX.Element {
  const [onDragOver, setOnDragOver] = useState(false);

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
      onDragOver={(e) => {
        e.preventDefault();
        setOnDragOver(true);
      }}
      onDragLeave={() => {
        setOnDragOver(false);
      }}
      onClick={onFilesPicked != null ? onClick : undefined}
      onDrop={onDrop}
      className={`cursor-pointer border-dashed border-2 border-gray-300 rounded-lg ${className} `}
    >
      <div
        className={`${
          onDragOver ? "bg-blue-900/75" : "bg-gray-100"
        } h-32 flex justify-center items-center`}
      >
        <div className="text-center">
          {onDragOver ? (
            <div className="text-2xl font-bold text-white">Drop files here</div>
          ) : (
            <>
              <div className="text-2xl font-bold">Drop files here</div>
              <div className="text-gray-500">or click to select files</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
