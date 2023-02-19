import { ReactNode, Fragment, useState, useEffect } from "react";
import { Dialog as BaseDialog, Transition } from "@headlessui/react";
import { cva, VariantProps } from "class-variance-authority";
import Button from "./Button";

const dialog = cva(
  "w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        full: "w-full h-full max-w-none",
      },
      padding: {
        false: "p-0",
        true: "p-6",
      },
    },
    defaultVariants: {
      size: "md",
      padding: true,
    },
  }
);

interface Props extends VariantProps<typeof dialog> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Dialog({
  open,
  onClose,
  children,
  size,
  padding,
}: Props): JSX.Element {
  return (
    <Transition appear show={open} as={Fragment}>
      <BaseDialog
        open={open}
        onClose={onClose}
        className={`relative inset-0 z-50 space-y-2 bg-red-400 shadow-2xl`}
      >
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <BaseDialog.Panel className={dialog({ size, padding })}>
              {children}
            </BaseDialog.Panel>
          </Transition.Child>
        </div>
      </BaseDialog>
    </Transition>
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

function Description({ children }: { children: ReactNode }): JSX.Element {
  return (
    <BaseDialog.Description as="p" className="mt-2 text-sm text-gray-700">
      {children}
    </BaseDialog.Description>
  );
}

function Warning({
  description,
  open,
  destructiveAction,
  children,
  onClose,
}: {
  description: ReactNode;
  open: boolean;
  onClose: () => void;
  destructiveAction: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <Title>Warning</Title>
        <Description>{description}</Description>
        <div className="flex flex-row justify-between">
          <Button onClick={onClose} intent="secondary">
            Cancel
          </Button>
          <Button onClick={destructiveAction} intent="destructive">
            Delete
          </Button>
        </div>
      </Dialog>
      {children}
    </>
  );
}

export default Object.assign(Dialog, {
  Title,
  Description,
  Warning,
});
