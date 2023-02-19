import { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  children: string;
  language: string;
}

export default function Code({ children }: Props): JSX.Element {
  return (
    <SyntaxHighlighter language="javascript" style={dracula}>
      {children}
    </SyntaxHighlighter>
  );
}
