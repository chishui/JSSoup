/**
 * HTMLTreeBuilder
 */

export default class TreeBuilder {


  constructor() {
    this.EMPTY_ELEMENT_TAGS = new Set([
        // These are from HTML5.
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
        
        // These are from earlier versions of HTML and are removed in HTML5.
        'basefont', 'bgsound', 'command', 'frame', 'image', 'isindex', 'nextid', 'spacer'
    ])
  }

  canBeEmptyElement(name) {
    return this.EMPTY_ELEMENT_TAGS.has(name)
  }
}


