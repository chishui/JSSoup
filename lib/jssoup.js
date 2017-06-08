if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  try {
    require("react-native");
    var htmlparser = Tautologistics.NodeHtmlParser;
  } catch(e) {
    var htmlparser = require("htmlparser");
  }
} else {
  var htmlparser = Tautologistics.NodeHtmlParser;
}

class SoupElement {
  constructor(parent=null) {
    this.parent = parent;
  }
}

class SoupString extends SoupElement{
  constructor(text, parent=null) {
    super(parent);
    this._text = text; 
  }
}

SoupString.prototype.toString = function() {
	return this._text;
}

class SoupTag extends SoupElement{
  constructor(name, attrs=null, parent=null) {
    super(parent);
    this.name = name;
    this.contents = []
    this.attrs = attrs || {}
  }

  append(child) {
    if (child)
      this.contents.push(child);
  }

  /*
   * Build a soup object tree
   */
  _build(children) {
    if (!children || children.length < 1) return;
    
    for (var i = 0; i < children.length; ++i) {
      var ele = this._transfer(children[i]);
      if (ele instanceof SoupTag) {
        ele._build(children[i].children);
      }
      this.append(ele);
    }   
  }

  /*
   * It's a soup object factory
   * It consturcts a soup object from dom.
   */
  _transfer (dom) {
    if (!dom) return null;
    if (dom.type === 'text') {
      return new SoupString(dom.data, this);
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
}

const ROOT_TAG_NAME = 'document';
export default class JSSoup extends SoupTag{
  constructor(text) {
    super(ROOT_TAG_NAME, null);
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) { }
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
