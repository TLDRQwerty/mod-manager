import { Switch as HSwitch } from "@headlessui/react";

interface Props {
  label: JSX.Element | string;
  checked: boolean;
  onChange: () => void;
}

export default function Switch({
  checked,
  onChange,
  label,
}: Props): JSX.Element {
  return (
    <HSwitch.Group>
      <div className="flex items-center">
        <HSwitch.Label className="mr-4">{label}</HSwitch.Label>
        <HSwitch
          checked={checked}
          onChange={onChange}
          className="relative inline-flex h-6 w-11 items-center rounded-full ui-checked:bg-blue-600 ui-not-checked:bg-gray-200"
        >
          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition ui-checked:translate-x-6 ui-not-checked:translate-x-1" />
        </HSwitch>
      </div>
    </HSwitch.Group>
  );
}
