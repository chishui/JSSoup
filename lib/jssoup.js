var htmlparser = require('htmlparser');
import TreeBuilder from './builder.js';

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  try {
    htmlparser = Tautologistics.NodeHtmlParser;
  } catch(e) {
  }
} else {
  htmlparser = Tautologistics.NodeHtmlParser;
}

class SoupElement {
  constructor(parent=null, previousElement=null, nextElement=null) {
    this.parent = parent;
    this.previousElement = previousElement;
    this.nextElement = nextElement;
  }

  get nextSibling () {
    if (!this.parent) return undefined;
    var index = this.parent.contents.indexOf(this);
    if (index == this.parent.contents.length - 1) return undefined;
    return this.parent.contents[index + 1];
  }

  get previousSibling () {
    if (!this.parent) return undefined;
    var index = this.parent.contents.indexOf(this);
    if (index == 0) return undefined;
    return this.parent.contents[index - 1];
  }

  // remove item from dom tree
  extract() {
    var extractFirst = this;
    var extractLast = this;
    var descendants = this.descendants;
    if (descendants && descendants.length) {
      extractLast = descendants[descendants.length - 1];
    }
    // these two maybe null
    var before = this.previousElement;
    var after = extractLast.nextElement;
    // modify extract subtree
    extractFirst.previousElement = null;
    extractLast.nextElement = null;
    if (before) {
      before.nextElement = after;
    }
    if (after) {
      after.previousElement = before;
    }
    //remove node from contents array
    if (this.parent) {
      var index = this.parent.contents.indexOf(this);
      if (index >= 0) {
        this.parent.contents.splice(index, 1);
      }
    }
    this.parent = null;
  }

  insert(index, newElement) {
    if (newElement == null) {
      throw "Cannot insert null element!";
    }

    if (newElement === this) {
      throw "Cannot add one itself!";
    }

    if (!(this instanceof SoupTag)) {
      throw "insert is not support in " + this.constructor.name;
    }

    if (index < 0) {
      throw "index cannot be negative!";
    }

    if (newElement instanceof JSSoup) {
      newElement.contents.forEach(element => {
        this.insert(index, element);
        ++index;
      });
      return
    }

    index = Math.min(index, this.contents.length);

    if (typeof newElement == 'string') {
      newElement = new SoupString(newElement);
    }

    if (newElement.parent) {
      if (newElement.parent === this) {
        let curIndex = this.contents.indexOf(newElement);
        if (index == curIndex) return;
        if (index > curIndex) {
          --index;
        }
      }
      newElement.extract();
    }

    var count = this.contents.length;

    let descendantsOfNewElement = newElement.descendants;
    let lastElementOfNewElement = (descendantsOfNewElement && descendantsOfNewElement.length > 0) ?
      descendantsOfNewElement[descendantsOfNewElement.length - 1] : newElement;
    // handle previous element of newElement
    if (index == 0) {
      newElement.previousElement = this;
    } else {
      let previousChild = this.contents[index - 1]
      let previousDescendants = previousChild.descendants
      newElement.previousElement = (previousDescendants && previousDescendants.length > 0) ?
        previousDescendants[previousDescendants.length - 1] : previousChild;
    }
    if (newElement.previousElement) {
      newElement.previousElement.nextElement = newElement;
    }
    // handle next element of newElement
    if (index < count) {
      lastElementOfNewElement.nextElement = this.contents[index];
    } else {
      var parent = this;
      var parentNextSibling = null;
      while (!parentNextSibling && parent) {
        parentNextSibling = parent.nextSibling;
        parent = parent.parent;
      }

      if (parentNextSibling) {
        lastElementOfNewElement.nextElement = parentNextSibling
      } else {
        lastElementOfNewElement.nextElement = null
      }
    }
    if (lastElementOfNewElement.nextElement) {
      lastElementOfNewElement.nextElement.previousElement = lastElementOfNewElement
    }

    newElement.parent = this;
    this.contents.splice(index, 0, newElement);
  }

  replaceWith(newElement) {
    if (this.parent == null) {
      throw "Cannot replace element without parent!";
    }

    if (newElement === this) {
      return;
    }

    if (newElement === this.parent) {
      throw "Cannot replace element with its parent!"
    }

    let parent = this.parent;
    var index = this.parent.contents.indexOf(this);
    this.extract();
    try {
      parent.insert(index, newElement);
    } catch (err) {
      throw 'Cannot replace this element!';
    }
    return this;
  }
}

class SoupComment extends SoupElement{
  constructor(text, parent=null, previousElement=null, nextElement=null) {
    super(parent, previousElement, nextElement);
    this._text = text;
  }
}

class SoupString extends SoupElement{
  constructor(text, parent=null, previousElement=null, nextElement=null) {
    super(parent, previousElement, nextElement);
    this._text = text;
  }
}

SoupString.prototype.toString = function() {
  return this._text;
}

class SoupDoctypeString extends SoupString {
  constructor(text, parent=null, previousElement=null, nextElement=null) {
    super(text, parent, previousElement, nextElement);
    this._text = text;
  }
}

SoupDoctypeString.prototype.toString = function() {
  return "<" + this._text + ">";
}

class SoupTag extends SoupElement {
  constructor(name, builder, attrs=null, parent=null, previousElement=null, nextElement=null) {
    super(parent, previousElement, nextElement);
    this.name = name;
    this.contents = [];
    this.attrs = attrs || {};
    this.hidden = false;
    this.builder = builder
  }

  _append(child) {
    if (child)
      this.contents.push(child);
  }

  /*
   * Build a soup object tree
   */
  _build(children) {
    if (!children || children.length < 1) return this;
    var last = this;
    for (var i = 0; i < children.length; ++i) {
      var ele = this._transform(children[i]);
      last.nextElement = ele;
      ele.previousElement = last;
      if (ele instanceof SoupTag) {
        last = ele._build(children[i].children);
      } else {
        last = ele;
      }
      this._append(ele);
    }
    return last;
  }

  /*
   * It's a soup object factory
   * It consturcts a soup object from dom.
   */
  _transform (dom) {
    if (!dom) return null;
    if (dom.type === 'text') {
      return new SoupString(dom.data, this);
    } else if (dom.type === 'comment') {
      return new SoupComment(dom.data, this);
    } else if (dom.type === 'directive') {//<!**
      if (dom.name === '!DOCTYPE') {
        return new SoupDoctypeString(dom.data, this);
      }
    }
    return new SoupTag(dom.name, this.builder, dom.attribs, this);
  }

  get string () {
    var cur = this;
    while (cur && cur.contents && cur.contents.length == 1) {
      cur = cur.contents[0];
    }
    if (!cur || cur instanceof SoupTag) return undefined;
    return cur;
  }

  find(name=undefined, attrs=undefined, string=undefined) {
    var r = this.findAll(name, attrs, string);
    if (r.length > 0) return r[0];
    return undefined;
  }

  /*
   * like find_all in BeautifulSoup
   */
  findAll (name=undefined, attrs=undefined, string=undefined) {
    var results = [];
    var strainer = new SoupStrainer(name, attrs, string);

    var descendants = this.descendants;
    for (var i = 0; i < descendants.length; ++i) {
      if (descendants[i] instanceof SoupTag) {
        var tag = strainer.match(descendants[i]);
        if (tag) {
          results.push(tag);
        }
      }
    }

    return results;
  }

  findPreviousSibling(name=undefined, attrs=undefined, string=undefined) {
    var results = this.findPreviousSiblings(name, attrs, string);
    if (results.length > 0) {
      return results[0];
    }
    return undefined;
  }

  findPreviousSiblings(name=undefined, attrs=undefined, string=undefined) {
    var results = [];
    var cur = this.previousSibling;
    var strainer = new SoupStrainer(name, attrs, string);
    while (cur) {
      if (cur instanceof SoupTag) {
        var tag = strainer.match(cur);
        if (tag) {
          results.push(tag);
        }
      }
      cur = cur.previousSibling;
    }
    return results;
  }


  findNextSibling(name=undefined, attrs=undefined, string=undefined) {
    var results = this.findNextSiblings(name, attrs, string);
    if (results.length > 0) {
      return results[0];
    }
    return undefined;
  }

  findNextSiblings(name=undefined, attrs=undefined, string=undefined) {
    var results = [];
    var cur = this.nextSibling;
    var strainer = new SoupStrainer(name, attrs, string);
    while (cur) {
      if (cur instanceof SoupTag) {
        var tag = strainer.match(cur);
        if (tag) {
          results.push(tag);
        }
      }
      cur = cur.nextSibling;
    }
    return results;
  }

  getText(separator='') {
    var text = [];
    var descendants = this.descendants;
    for (var i = 0; i < descendants.length; ++i) {
      if (descendants[i] instanceof SoupString) {
        text.push(descendants[i]._text);
      }
    }
    return text.join(separator);
  }

  get text() {
    return this.getText();
  }

  get descendants() {
    var ret = [];
    var cur = this.nextElement;
    while (cur) {
      var parent = cur.parent;
      while (parent && parent != this) {
        parent = parent.parent;
      }
      if (!parent) break;
      ret.push(cur);
      cur = cur.nextElement;
    }
    return ret;
  }

  _convertAttrsToString() {
    var text = '';
    if (!this.attrs) return text;
    for (var key in this.attrs) {
      if (Array.isArray(this.attrs[key])) {
        text += key + '="' + this.attrs[key].join(' ') + '" ';
      } else {
        text += key + '="' + this.attrs[key] + '" ';
      }
    }
    text = text.trim();
    return text;
  }

  _prettify(indent, breakline, level=0) {
    var text = '';
    if (this.hidden && level == 0) {
      --level;
    }
    if (!this.hidden) {
      var attrs = this._convertAttrsToString();
      if (attrs) {
        text += indent.repeat(level) + '<' + this.name + ' ' + attrs;
      } else {
        text += indent.repeat(level) + '<' + this.name;
      }
    }

    // is an element doesn't have any contents, it's a self closing element
    if (!this.hidden) {
      if (this._isEmptyElement() && this.builder.canBeEmptyElement(this.name)) {
        text +=  ' />' + breakline;
        return text;
      } else {
        text +=  '>' + breakline;
      }
    }

    for (var i = 0; i < this.contents.length; ++i) {
      if (this.contents[i] instanceof SoupString) {
        var curText = this.contents[i].toString();
        curText = curText.trim();
        if (curText.length != 0) {
          if (curText.substring(curText.length - 1) == "\n") {
            text += indent.repeat(level + 1) + curText;
          } else {
            text += indent.repeat(level + 1) + curText + breakline;
          }
        }
      } else {
        if (this.contents[i] instanceof SoupComment) {
          text += indent.repeat(level+1) + "<!--" +  this.contents[i]._text + "-->" + breakline;
          } else {
            text += this.contents[i]._prettify(indent, breakline, level + 1);
          }
      }
    }

    if (!this.hidden) {
      text += indent.repeat(level) + '</' + this.name + '>' + breakline;
    }

    return text;
  }

  prettify(indent=' ', breakline='\n') {
    return this._prettify(indent, breakline).trim();
  }

  /*
   * Append item in contents
   */
  append(item) {
    var pre = this;
    var next = this.nextElement;
    var appendFirst = item;
    var appendLast = item;
    var itemDescendants = item.descendants;
    if (itemDescendants && itemDescendants.length > 0) {
      appendLast = itemDescendants[itemDescendants.length - 1];
    }
    var descendants = this.descendants;
    if (descendants && descendants.length > 0) {
      pre = descendants[descendants.length - 1];
      next = pre.nextElement;
    }

    //merge two SoupString
    if (item instanceof SoupString && pre instanceof SoupString) {
      pre._text += item._text;
      return;
    }

    appendFirst.previousElement = pre;
    appendLast.nextElement = next;
    if (pre)
      pre.nextElement = appendFirst;
    if (next)
      next.previousElement = appendLast;

    this.contents.push(item);
    item.parent = this;
  }

  _isEmptyElement() {
    return this.contents.length == 0;
  }
}

SoupTag.prototype.toString = function() {
  return this.prettify('', '');
}

const ROOT_TAG_NAME = '[document]';

export default class JSSoup extends SoupTag {
  constructor(text, ignoreWhitespace=true) {
    super(ROOT_TAG_NAME, new TreeBuilder(), null);
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error);
      }
      else { }
    }, {verbose: false, ignoreWhitespace: ignoreWhitespace});

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(text);

    if (Array.isArray(handler.dom)) {
      this._build(handler.dom);
    } else {
      this._build([handler.dom]);
    }

    this.hidden = true;
  }
}

class SoupStrainer {
  constructor(name, attrs, string) {
    if (typeof attrs == 'string') {
      attrs = {class: [attrs]};
    } else if (Array.isArray(attrs)) {
      attrs = {class: attrs};
    } else if (attrs && attrs.class && typeof attrs.class == 'string') {
      attrs.class = [attrs.class];
    }
    if (attrs && attrs.class) {
      for (var i = 0; i < attrs.class.length; ++i) {
        attrs.class[i] = attrs.class[i].trim();
      }
    }
    this.name = name;
    this.attrs = attrs;
    this.string = string;
  }

  match(tag) {
    // match string
    if (this.name == undefined && this.attrs == undefined) {
      if (this.string) {
        if (this._matchName(tag.string, this.string))
          return tag.string;
        else
          return null;
      }
      return tag;
    }
    // match tag name
    var match = this._matchName(tag.name, this.name);
    if (!match) return null;
    // match string
    match = this._matchName(tag.string, this.string);
    if (!match) return null;
    // match attributes
    if (typeof this.attrs == 'object') {
      if (!this._isEmptyObject(this.attrs)) {
        var props = Object.getOwnPropertyNames(this.attrs);
        var found = false;
        for (var i = 0; i < props.length; ++i) {
          if (props[i] in tag.attrs && this._matchAttrs(props[i], tag.attrs[props[i]], this.attrs[props[i]])) {
            found = true;
            break;
          }
        }
        if (!found) return null;
      }
    }
    return tag;
  }

  _matchName(tagItem, name) {
    if (name == undefined || name == null) return true;
    // if name is an array, then tag match any item in this array is a match.
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; ++i) {
        var match = this._matchName(tagItem, name[i]);
        if (match) return true;
      }
      return false;
    }
    return tagItem == name;
  }

  _matchAttrs(name, candidateAttrs, attrs) {
    if (typeof candidateAttrs == 'string') {
      if (name == 'class') {
        candidateAttrs = candidateAttrs.replace(/\s\s+/g, ' ').trim().split(' ');
      } else {
        candidateAttrs = [candidateAttrs];
      }
    }
    if (typeof attrs == 'string') {
      attrs = [attrs];
    }
    for (var i = 0; i < attrs.length; ++i) {
      if (candidateAttrs.indexOf(attrs[i]) < 0)
        return false;
    }
    return true;
  }

  _isEmptyObject(obj) {
    return Object.keys(obj).length == 0;
  }
}
