declare module "jssoup" {
  class TreeBuilder {
    public canBeEmptyElement(name: string): boolean;
  }

  class SoupElement {
    public parent?: SoupElement;
    public previousElement?: SoupElement;
    public nextElement?: SoupElement;

    constructor(
      parent?: SoupElement,
      previousElement?: SoupElement,
      nextElement?: SoupElement
    );

    public get nextSibling(): SoupElement | undefined;
    public get previousSibling(): SoupElement | undefined;
    public  get nextSiblings(): SoupElement | undefined;
    public get previousSiblings(): SoupElement | undefined;

    /** remove item from dom tree */
    public extract(): void;
    public insert(index: number, newElement: SoupElement | string): void;
    public replaceWith(newElement: SoupElement | string): this | undefined;
  }

  class SoupString extends SoupElement {
    constructor(
      text: string,
      parent?: SoupElement,
      previousElement?: SoupElement,
      nextElement?: SoupElement
    );

    toString(): string;
  }

  type Args =
    | string
    | string[]
    | { class: string }
    | { class: string[] }
    | { [attribute: string]: string };

  class SoupTag extends SoupElement {
    public name: string;
    public builder: TreeBuilder;
    public attrs: { [attribute: string]: string };

    /** contains direct children of current element */
    public contents: SoupElement[];

    constructor(
      name: string,
      builder: TreeBuilder,
      attrs: { [attribute: string]: string }
    );

    public get string(): SoupString;
    public get text(): string;

    /** includes all elements of which current element is the ancestor of */
    public get descendants(): SoupElement[];

    public find(name?: string, attrs?: Args, string?: string): SoupElement | undefined;
    /** like find_all in BeautifulSoup */
    public findAll(name?: string, attrs?: Args, string?: string): SoupElement[];
    public findPreviousSibling(name?: string, attrs?: Args, string?: string): SoupElement | undefined;
    public findPreviousSiblings(name?: string, attrs?: Args, string?: string): SoupElement[];
    public findNextSibling(name?: string, attrs?: Args, string?: string): SoupElement | undefined;
    public findNextSiblings(name?: string, attrs?: Args, string?: string): SoupElement[];
    public getText(separator?: string): string;
    
    public prettify(indent?: string, breakline?: string): string;
    public toString(): string;

    public append(item: SoupElement): void;
    
    /** @param expression - a CSS expression like "div > .class1"*/
    public select(expression: string): SoupElement | undefined;;

    /** @param expression - a CSS expression like "div > .class1"*/
    public selectOne(expression: string): SoupElement[];
  }

  export default class JSSoup extends SoupTag {
    /** The text element only contains whitespace will be ignored by default. To disable this feature, set "ignoreWhitespace" to true. */
    constructor(text: string, ignoreWhitespace?: boolean);
    public hidden: boolean;
  }
}
