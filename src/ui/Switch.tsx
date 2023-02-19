import { Switch as HSwitch } from "@headlessui/react";
import clsx from "clsx";

interface Props {
  label: JSX.Element | string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Switch({
  checked,
  onChange,
  label,
  disabled,
}: Props): JSX.Element {
  return (
    <HSwitch.Group>
      <div className="flex items-center">
        <HSwitch.Label className="mr-4">{label}</HSwitch.Label>
        <HSwitch
          checked={checked}
          onChange={disabled === false ? undefined : onChange}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full",
            {
              "cursor-default border border-gray-200": disabled,
              "cursor-pointer ui-checked:bg-blue-600 ui-not-checked:bg-gray-200":
                disabled === false || disabled == null,
            }
          )}
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition ui-checked:translate-x-6 ui-not-checked:translate-x-1",
              { "bg-gray-400": disabled }
            )}
          />
        </HSwitch>
      </div>
    </HSwitch.Group>
  );
}
