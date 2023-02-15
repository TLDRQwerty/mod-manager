import React from "react";

function Table({
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>): JSX.Element {
  return (
    <table
      className="border-collapse border border-gray-300 w-full"
      {...props}
    />
  );
}

function Head({
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTableSectionElement>,
  HTMLTableSectionElement
>): JSX.Element {
  return <thead className="border border-gray-300" {...props} />;
}

function Body({
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTableSectionElement>,
  HTMLTableSectionElement
>): JSX.Element {
  return <tbody className="border border-gray-300" {...props} />;
}

function Row({
  ...props
}: React.TableHTMLAttributes<HTMLTableRowElement>): JSX.Element {
  return <tr className="border border-gray-300" {...props} />;
}

function Cell({
  ...props
}: React.TableHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <td className="border border-gray-300" {...props} />;
}

function Header({
  className = "",
  ...props
}: React.TableHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <th className={`border border-gray-300 ${className}`} {...props} />;
}

export default Object.assign(Table, {
  Head,
  Body,
  Row,
  Cell,
  Header,
});
