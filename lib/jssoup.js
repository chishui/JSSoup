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

  extract() {
    if (this.parent) {
      var index = this.parent.contents.indexOf(this);
      this.parent.contents.splice(index, 1);
    }
    this.parent = null;
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

  append(child) {
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
      this.append(ele);
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

  _dfs(results, strainer) {
    if (strainer.match(this)) {
      results.push(this);
    }

    if (this.contents) {
      for (var i = 0; i < this.contents.length; ++i) {
        if (this.contents[i] instanceof SoupTag) {
          this.contents[i]._dfs(results, strainer);
        }
      }
    }
  }

  /*
   * like find_all in BeautifulSoup
   */
  findAll (name=undefined, attrs=undefined) {
    var results = [];
    var strainer = new SoupStrainer(name, attrs);
    this._dfs(results, strainer); 
    return results;
  }

  getText(separator='') {
    var text = [];
    for (var i of this.descendants) {
      if (i instanceof SoupString) {
        text.push(i._text);
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
  constructor(name, attrs) {
    if (typeof attrs == 'string' || Array.isArray(attrs)) {
      attrs = {class: attrs};
    }
    this.name = name;
    this.attrs = attrs;
  }

  match(tag) {
    var match = this._matchName(tag, this.name);
    if (!match) return false;

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
        if (!found) return false;
      }
    }
    return true;  
  }

  _matchName(tag, name) {
    if (name == undefined || name == null) return true;
    // if name is an array, then tag match any item in this array is a match.
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; ++i) {
        var match = this._matchName(tag, name[i]);
        if (match) return true;
      }
      return false;
    }
    return tag.name == name;
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
