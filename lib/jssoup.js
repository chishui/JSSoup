var htmlparser = require('htmlparser');
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

class SoupTag extends SoupElement{
  constructor(name, attrs=null, parent=null, previousElement=null, nextElement=null) {
    super(parent, previousElement, nextElement);
    this.name = name;
    this.contents = []
    this.attrs = attrs || {}
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
      var ele = this._transfer(children[i]);
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
  _transfer (dom) {
    if (!dom) return null;
    if (dom.type === 'text') {
      return new SoupString(dom.data, this);
    } else if (dom.type === 'comment') {
      return new SoupComment(dom.data, this);
    } else {
      return new SoupTag(dom.name, dom.attribs, this);
    }
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
        if (tag)
          results.push(tag);
      }
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

  //* descendants () {
    //var cur = this.nextElement;
    //while (cur) {
      //var parent = cur.parent;
      //while (parent && parent != this) {
        //parent = parent.parent;
      //}
      //if (!parent) break;
      //yield cur;
      //cur = cur.nextElement;
    //}
    //return undefined;
  //}

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
    var attrs = this._convertAttrsToString(); 
    if (attrs) {
      text += indent.repeat(level) + '<' + this.name + ' ' + attrs + '>' + breakline;
    } else {
      text += indent.repeat(level) + '<' + this.name + '>' + breakline;
    }

    for (var i = 0; i < this.contents.length; ++i) {
      if (this.contents[i] instanceof SoupString) {
        text += indent.repeat(level + 1) + this.contents[i].toString() + breakline;
      } else {
        text += this.contents[i]._prettify(indent, breakline, level + 1);
      }
    }
    text += indent.repeat(level) + '</' + this.name + '>' + breakline;
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
}

SoupTag.prototype.toString = function() {
  return this.prettify('', ''); 
}

const ROOT_TAG_NAME = '[document]';
export default class JSSoup extends SoupTag{
  constructor(text) {
    super(ROOT_TAG_NAME, null);
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error);
      }
      else { }
    }, {verbose: false, ignoreWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(text);

    if (Array.isArray(handler.dom)) {
      this._build(handler.dom); 
    } else {
      this._build([handler.dom]); 
    }
  }
}

class SoupStrainer {
  constructor(name, attrs, string) {
    if (typeof attrs == 'string' || Array.isArray(attrs)) {
      attrs = {class: attrs};
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
          if (props[i] in tag.attrs && this._matchAttrs(tag.attrs[props[i]], this.attrs[props[i]])) {
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

  _matchAttrs(candidateAttrs, attrs) {
    if (typeof attrs == 'string') {
      attrs = [attrs];
    }
    if (typeof candidateAttrs == 'string') {
      candidateAttrs = [candidateAttrs];
    }
    for (var i = 0; i < candidateAttrs.length; ++i) {
      if (attrs.indexOf(candidateAttrs[i]) < 0) 
        return false;
    }
    return true;
  }

  _isEmptyObject(obj) {
    return Object.keys(obj).length == 0;
  }
}
