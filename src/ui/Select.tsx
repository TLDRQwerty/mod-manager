import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";

interface Props<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption: (option: T) => JSX.Element;
  renderValue: (value: T) => JSX.Element;
  getKey: (option: T) => string;
  buttonClassName?: string;
  itemClassName?: string;
}

export default function Select<T>({
  value,
  options,
  onChange,
  renderOption,
  renderValue,
  getKey,
  buttonClassName,
  itemClassName,
}: Props<T>): JSX.Element {
  return (
    <Listbox value={value} onChange={onChange}>
      <Listbox.Button
        className={clsx(
          "relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm",
          buttonClassName
        )}
      >
        {renderValue(value)}
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              key={getKey(option)}
              value={option}
              className={clsx(
                "relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 ui-active:bg-amber-100 ui-active:text-amber-900",
                itemClassName
              )}
            >
              {renderOption(option)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}
