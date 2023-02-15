import { ReactNode } from "react";
import { Dialog as BaseDialog } from "@headlessui/react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Dialog({ open, onClose, children }: Props): JSX.Element {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      className="relative z-50 inset-0 shadow-2xl space-y-2"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <BaseDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          {children}
        </BaseDialog.Panel>
      </div>
    </BaseDialog>
  );
}

function Title({ children }: { children: ReactNode }): JSX.Element {
  return (
    <BaseDialog.Title
      as="h1"
      className="text-lg font-medium leading-6 text-gray-900"
    >
      {children}
    </BaseDialog.Title>
  );
}

export default Object.assign(Dialog, {
  Title,
  Description: BaseDialog.Description,
});
