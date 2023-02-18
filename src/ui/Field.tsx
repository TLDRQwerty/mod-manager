import { ReactNode } from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

interface Props {
  id: string;
  label: ReactNode;
  children: ReactNode;
  error?:
    | string
    | undefined
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>;
}

export default function Field({
  id,
  label,
  children,
  error,
}: Props): JSX.Element {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error != null && typeof error === "string" ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
