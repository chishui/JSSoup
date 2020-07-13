'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _builder = require('./builder.js');

var _builder2 = _interopRequireDefault(_builder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var htmlparser = require('htmlparser');


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  try {
    htmlparser = Tautologistics.NodeHtmlParser;
  } catch (e) {}
} else {
  htmlparser = Tautologistics.NodeHtmlParser;
}

var SoupElement = function () {
  function SoupElement() {
    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var previousElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var nextElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, SoupElement);

    this.parent = parent;
    this.previousElement = previousElement;
    this.nextElement = nextElement;
  }

  _createClass(SoupElement, [{
    key: 'extract',


    // remove item from dom tree
    value: function extract() {
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
  }, {
    key: 'insert',
    value: function insert(index, newElement) {
      var _this = this;

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
        newElement.contents.forEach(function (element) {
          _this.insert(index, element);
          ++index;
        });
        return;
      }

      index = Math.min(index, this.contents.length);

      if (typeof newElement == 'string') {
        newElement = new SoupString(newElement);
      }

      if (newElement.parent) {
        if (newElement.parent === this) {
          var curIndex = this.contents.indexOf(newElement);
          if (index == curIndex) return;
          if (index > curIndex) {
            --index;
          }
        }
        newElement.extract();
      }

      var count = this.contents.length;

      var descendantsOfNewElement = newElement.descendants;
      var lastElementOfNewElement = descendantsOfNewElement && descendantsOfNewElement.length > 0 ? descendantsOfNewElement[descendantsOfNewElement.length - 1] : newElement;
      // handle previous element of newElement
      if (index == 0) {
        newElement.previousElement = this;
      } else {
        var previousChild = this.contents[index - 1];
        var previousDescendants = previousChild.descendants;
        newElement.previousElement = previousDescendants && previousDescendants.length > 0 ? previousDescendants[previousDescendants.length - 1] : previousChild;
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
          lastElementOfNewElement.nextElement = parentNextSibling;
        } else {
          lastElementOfNewElement.nextElement = null;
        }
      }
      if (lastElementOfNewElement.nextElement) {
        lastElementOfNewElement.nextElement.previousElement = lastElementOfNewElement;
      }

      newElement.parent = this;
      this.contents.splice(index, 0, newElement);
    }
  }, {
    key: 'replaceWith',
    value: function replaceWith(newElement) {
      if (this.parent == null) {
        throw "Cannot replace element without parent!";
      }

      if (newElement === this) {
        return;
      }

      if (newElement === this.parent) {
        throw "Cannot replace element with its parent!";
      }

      var parent = this.parent;
      var index = this.parent.contents.indexOf(this);
      this.extract();
      try {
        parent.insert(index, newElement);
      } catch (err) {
        throw 'Cannot replace this element!';
      }
      return this;
    }
  }, {
    key: 'nextSibling',
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == this.parent.contents.length - 1) return undefined;
      return this.parent.contents[index + 1];
    }
  }, {
    key: 'previousSibling',
    get: function get() {
      if (!this.parent) return undefined;
      var index = this.parent.contents.indexOf(this);
      if (index == 0) return undefined;
      return this.parent.contents[index - 1];
    }
  }]);

  return SoupElement;
}();

var SoupComment = function (_SoupElement) {
  _inherits(SoupComment, _SoupElement);

  function SoupComment(text) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupComment);

    var _this2 = _possibleConstructorReturn(this, (SoupComment.__proto__ || Object.getPrototypeOf(SoupComment)).call(this, parent, previousElement, nextElement));

    _this2._text = text;
    return _this2;
  }

  return SoupComment;
}(SoupElement);

var SoupString = function (_SoupElement2) {
  _inherits(SoupString, _SoupElement2);

  function SoupString(text) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupString);

    var _this3 = _possibleConstructorReturn(this, (SoupString.__proto__ || Object.getPrototypeOf(SoupString)).call(this, parent, previousElement, nextElement));

    _this3._text = text;
    return _this3;
  }

  return SoupString;
}(SoupElement);

SoupString.prototype.toString = function () {
  return this._text;
};

var SoupDoctypeString = function (_SoupString) {
  _inherits(SoupDoctypeString, _SoupString);

  function SoupDoctypeString(text) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var previousElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var nextElement = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, SoupDoctypeString);

    var _this4 = _possibleConstructorReturn(this, (SoupDoctypeString.__proto__ || Object.getPrototypeOf(SoupDoctypeString)).call(this, text, parent, previousElement, nextElement));

    _this4._text = text;
    return _this4;
  }

  return SoupDoctypeString;
}(SoupString);

SoupDoctypeString.prototype.toString = function () {
  return "<" + this._text + ">";
};

var SoupTag = function (_SoupElement3) {
  _inherits(SoupTag, _SoupElement3);

  function SoupTag(name, builder) {
    var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var previousElement = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var nextElement = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

    _classCallCheck(this, SoupTag);

    var _this5 = _possibleConstructorReturn(this, (SoupTag.__proto__ || Object.getPrototypeOf(SoupTag)).call(this, parent, previousElement, nextElement));

    _this5.name = name;
    _this5.contents = [];
    _this5.attrs = attrs || {};
    _this5.hidden = false;
    _this5.builder = builder;
    return _this5;
  }

  _createClass(SoupTag, [{
    key: '_append',
    value: function _append(child) {
      if (child) this.contents.push(child);
    }

    /*
     * Build a soup object tree
     */

  }, {
    key: '_build',
    value: function _build(children) {
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

  }, {
    key: '_transform',
    value: function _transform(dom) {
      if (!dom) return null;
      if (dom.type === 'text') {
        return new SoupString(dom.data, this);
      } else if (dom.type === 'comment') {
        return new SoupComment(dom.data, this);
      } else if (dom.type === 'directive') {
        //<!**
        if (dom.name === '!DOCTYPE') {
          return new SoupDoctypeString(dom.data, this);
        }
      }
      return new SoupTag(dom.name, this.builder, dom.attribs, this);
    }
  }, {
    key: 'find',
    value: function find() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var r = this.findAll(name, attrs, string);
      if (r.length > 0) return r[0];
      return undefined;
    }

    /*
     * like find_all in BeautifulSoup
     */

  }, {
    key: 'findAll',
    value: function findAll() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

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
  }, {
    key: 'findPreviousSibling',
    value: function findPreviousSibling() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var results = this.findPreviousSiblings(name, attrs, string);
      if (results.length > 0) {
        return results[0];
      }
      return undefined;
    }
  }, {
    key: 'findPreviousSiblings',
    value: function findPreviousSiblings() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

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
  }, {
    key: 'findNextSibling',
    value: function findNextSibling() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var results = this.findNextSiblings(name, attrs, string);
      if (results.length > 0) {
        return results[0];
      }
      return undefined;
    }
  }, {
    key: 'findNextSiblings',
    value: function findNextSiblings() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var string = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

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
  }, {
    key: 'getText',
    value: function getText() {
      var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var text = [];
      var descendants = this.descendants;
      for (var i = 0; i < descendants.length; ++i) {
        if (descendants[i] instanceof SoupString) {
          text.push(descendants[i]._text);
        }
      }
      return text.join(separator);
    }
  }, {
    key: '_convertAttrsToString',
    value: function _convertAttrsToString() {
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
  }, {
    key: '_prettify',
    value: function _prettify(indent, breakline) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

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
          text += ' />' + breakline;
          return text;
        } else {
          text += '>' + breakline;
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
            text += indent.repeat(level + 1) + "<!--" + this.contents[i]._text + "-->" + breakline;
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
  }, {
    key: 'prettify',
    value: function prettify() {
      var indent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ' ';
      var breakline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\n';

      return this._prettify(indent, breakline).trim();
    }

    /*
     * Append item in contents
     */

  }, {
    key: 'append',
    value: function append(item) {
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
      if (pre) pre.nextElement = appendFirst;
      if (next) next.previousElement = appendLast;

      this.contents.push(item);
      item.parent = this;
    }
  }, {
    key: '_isEmptyElement',
    value: function _isEmptyElement() {
      return this.contents.length == 0;
    }
  }, {
    key: 'string',
    get: function get() {
      var cur = this;
      while (cur && cur.contents && cur.contents.length == 1) {
        cur = cur.contents[0];
      }
      if (!cur || cur instanceof SoupTag) return undefined;
      return cur;
    }
  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }, {
    key: 'descendants',
    get: function get() {
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
  }]);

  return SoupTag;
}(SoupElement);

SoupTag.prototype.toString = function () {
  return this.prettify('', '');
};

var ROOT_TAG_NAME = '[document]';

var JSSoup = function (_SoupTag) {
  _inherits(JSSoup, _SoupTag);

  function JSSoup(text) {
    var ignoreWhitespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, JSSoup);

    var _this6 = _possibleConstructorReturn(this, (JSSoup.__proto__ || Object.getPrototypeOf(JSSoup)).call(this, ROOT_TAG_NAME, new _builder2.default(), null));

    var handler = new htmlparser.DefaultHandler(function (error, dom) {
      if (error) {
        console.log(error);
      } else {}
    }, { verbose: false, ignoreWhitespace: ignoreWhitespace });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(text);

    if (Array.isArray(handler.dom)) {
      _this6._build(handler.dom);
    } else {
      _this6._build([handler.dom]);
    }

    _this6.hidden = true;
    return _this6;
  }

  return JSSoup;
}(SoupTag);

exports.default = JSSoup;

var SoupStrainer = function () {
  function SoupStrainer(name, attrs, string) {
    _classCallCheck(this, SoupStrainer);

    if (typeof attrs == 'string') {
      attrs = { class: [attrs] };
    } else if (Array.isArray(attrs)) {
      attrs = { class: attrs };
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

  _createClass(SoupStrainer, [{
    key: 'match',
    value: function match(tag) {
      // match string
      if (this.name == undefined && this.attrs == undefined) {
        if (this.string) {
          if (this._matchName(tag.string, this.string)) return tag.string;else return null;
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
      if (_typeof(this.attrs) == 'object') {
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
  }, {
    key: '_matchName',
    value: function _matchName(tagItem, name) {
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
  }, {
    key: '_matchAttrs',
    value: function _matchAttrs(name, candidateAttrs, attrs) {
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
        if (candidateAttrs.indexOf(attrs[i]) < 0) return false;
      }
      return true;
    }
  }, {
    key: '_isEmptyObject',
    value: function _isEmptyObject(obj) {
      return Object.keys(obj).length == 0;
    }
  }]);

  return SoupStrainer;
}();