import clsx from "clsx";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

function Table({ className, children, ...rest }: Props): JSX.Element {
  return (
    <div className={clsx("grid grid-template-cols")} {...rest}>
      {children}
    </div>
  );
}

function Head({ children, className, ...rest }: Props): JSX.Element {
  return (
    <div className={clsx("bg-gray-200 font-bold", className)} {...rest}>
      {children}
    </div>
  );
}

function Body({ children, ...rest }: Props): JSX.Element {
  return <div {...rest}>{children}</div>;
}

function Row({ children, className, ...rest }: Props): JSX.Element {
  return (
    <div
      className={clsx(
        "items-center grid gap-4 border-b border-black grid-cols-[repeat(auto-fit,minmax(20px,_1fr))] hover:bg-gray-300/25",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function Cell({ children, className, ...rest }: Props): JSX.Element {
  return (
    <div className={clsx(className)} {...rest}>
      {children}
    </div>
  );
}

function Header({ children, className, ...rest }: Props): JSX.Element {
  return (
    <div className={clsx(className)} {...rest} {...rest}>
      {children}
    </div>
  );
}

export default Object.assign(Table, {
  Head,
  Body,
  Row,
  Cell,
  Header,
});
