import { Fragment, ReactElement, useRef } from "react";
import Code from "./Code";
import Image from "./Image";

interface Props {
  value: string;
}

class HTMLParser {
  private readonly parser: DOMParser = new DOMParser();
  private readonly doc: Document;
  private readonly root: HTMLElement;

  constructor(html: string) {
    this.doc = this.parser.parseFromString(html, "text/html");
    this.root = this.doc.body;
  }

  private parseTextNode(node: Node): ReactElement | null {
    if (node.textContent == null) {
      return null;
    }

    return <>{this.parseText(node.textContent)}</>;
  }

  private parseText(text: string | null): string {
    if (text == null) {
      return "";
    }
    const replacedText = text.replace(/\[.*?\]/g, "").replace(/<br \/>/g, "\n");
    return replacedText;
  }

  private parseElementNode(node: Node): ReactElement | null {
    const element = node as HTMLElement;
    const { tagName } = element;

    switch (tagName) {
      case "IMG": {
        const src = element.getAttribute("src");
        const alt = element.getAttribute("alt");
        if (src == null) {
          return null;
        }
        return <Image src={src} alt={alt ?? undefined} />;
      }
      case "BR":
        return null;
      case "P":
        return <p>{this.parseChildren(element)}</p>;
      case "A": {
        const href = element.getAttribute("href");
        if (href == null) {
          return null;
        }
        return (
          <a target="_blank" rel="noreferrer" href={href}>
            {this.parseChildren(element)}
          </a>
        );
      }
      case "B":
        return <b>{this.parseChildren(element)}</b>;
      case "SPAN":
        return <span>{this.parseChildren(element)}</span>;
      case "OL":
        return <ol>{this.parseChildren(element)}</ol>;
      case "UL":
        return <ul>{this.parseChildren(element)}</ul>;
      case "LI":
        return <li>{this.parseChildren(element)}</li>;
      case "DIV":
        return <div>{this.parseChildren(element)}</div>;
      case "CODE":
        return (
          <Code language="json">{this.parseText(element.textContent)}</Code>
        );
      case "I":
        return <i>{this.parseChildren(element)}</i>;
      default:
        console.log("Unknown tag", tagName);
        return null;
    }
  }

  private parseNode(node: Node): ReactElement | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.parseTextNode(node);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.parseElementNode(node);
    }
    return null;
  }

  private parseChildren(node: Node): ReactElement[] {
    const children: ReactElement[] = [];

    for (const child of node.childNodes) {
      const element = this.parseNode(child);

      if (element != null) {
        children.push(element);
      }
    }

    return children;
  }

  public parse(): ReactElement | null {
    return <Fragment>{this.parseChildren(this.root)}</Fragment>;
  }
}

export default function HTMLRender({ value }: Props): JSX.Element | null {
  const domParser = useRef<HTMLParser>(new HTMLParser(value)).current;
  return domParser.parse();
}
