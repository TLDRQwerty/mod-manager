import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";

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
        className={clsx("bg-gray-100 w-full p-2 rounded-md", buttonClassName)}
      >
        {renderValue(value)}
      </Listbox.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Listbox.Options
          className={clsx("bg-gray-100 w-full p-2 rounded-md", itemClassName)}
        >
          {options.map((option) => (
            <Listbox.Option key={getKey(option)} value={option}>
              {renderOption(option)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}
