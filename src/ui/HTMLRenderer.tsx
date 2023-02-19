import { createElement, Fragment, ReactElement, useRef } from "react";
import Image from "./Image";

interface Props {
  value: string;
}

const BB_CODE_REGEX = /\[([^\]]+)\]/g;

class HTMLParser {
  private readonly domParser: DOMParser = new DOMParser();
  private readonly dom: Document;

  constructor(input: string) {
    this.dom = this.domParser.parseFromString(input, "text/html");
  }

  walk(node: Node | ChildNode | null, callback: (node: Node) => void): void {
    if (node == null) {
      return;
    }
    callback(node);
    node = node.firstChild;
    while (node != null) {
      this.walk(node, callback);
      node = node.nextSibling;
    }
  }

  imgTagToReactElement(node: HTMLImageElement): ReactElement {
    const src = node.getAttribute("src");
    if (src == null) {
      return <Fragment />;
    }
    return <Image src={src} />;
  }

  pTagToReactElement(node: HTMLParagraphElement): ReactElement {
    if (BB_CODE_REGEX.test(node.textContent ?? "")) {
      return <Fragment />;
    } else {
      return <p>{node.textContent}</p>;
    }
  }

  parse(): ReactElement {
    const root = this.dom.body;
    const children: ReactElement[] = [];
    this.walk(root, (node) => {
      switch (node.nodeName) {
        case "IMG":
          children.push(this.imgTagToReactElement(node as HTMLImageElement));
          break;
        case "BR":
          break;
        case "P":
          children.push(this.pTagToReactElement(node as HTMLParagraphElement));
          break;
        default:
          if (node.textContent != null) {
            const text = node.textContent;
            const matches = text.match(BB_CODE_REGEX);
            if (matches == null) {
              children.push(<Fragment key={text}>{text}</Fragment>);
            }
          }
          break;
      }
    });
    return <Fragment>{children}</Fragment>;
  }
}

export default function HTMLRender({ value }: Props): JSX.Element | null {
  const domParser = useRef<HTMLParser>(new HTMLParser(value)).current;
  return domParser.parse();
}
