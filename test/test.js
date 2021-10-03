const assert = require('assert');
var expect = require('chai').expect;
import JSSoup from '../lib/jssoup';

const data = `
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <p class="title"><b>The Dormouse's story</b></p>

  <p class="story">Once upon a time there were three little sisters; and their names were
  <a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
  <a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
  <a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
  and they lived at the bottom of a well.</p>

  <p class="story">...</p>

  <span class="one">One</span>
  <span class="two">Two</span>
  <span class="three">Three</span>
  <span class="one two three">One Two Three</span>

  <div class=" whitespace">Whitespace Left</div>
  <div class="whitespace ">Whitespace Right</div>
  <div class=" whitespace ">Whitespace Left and Right</div>
  <div class="    so    much    whitespace    ">Whitespace</div>

  </body>
  </html>
`;

describe('contents', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.contents.length, 1);
    assert.equal(soup.contents[0].contents.length, 1);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello<b>aa</b>cc</a>');
    assert.equal(soup.contents.length, 1);
    assert.equal(soup.contents[0].contents.length, 3);
    done();
  });
});

describe('parent', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.parent, null);
    assert.equal(soup.contents[0].parent, soup);
    assert.equal(soup.contents[0].contents[0].parent, soup.contents[0]);
    done();
  });
});

describe('name', function() {
  it('should get correct name', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.name, '[document]');
    assert.equal(soup.contents[0].name, 'a');
    done();
  });

  it('should not have name for SoupString', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.contents[0].contents[0].name, undefined);
    done();
  });
});

describe('string', function() {
  it('should print text in first level without sub tag', function(done) {
    var soup = new JSSoup('<a>text</a>');
    assert.equal(soup.contents[0].string, 'text');
    done();
  });

  it('should print text in deepest level without sub tag', function(done) {
    var soup = new JSSoup('<a><b><c>text</c></b></a>');
    assert.equal(soup.string, 'text');
    done();
  });

  it('should return undefined with sub tag', function(done) {
    var soup = new JSSoup('<a>ab<b>text</b></a>');
    assert.equal(soup.string, undefined);
    done();
  });

  it('should return undefined with nothing', function(done) {
    var soup = new JSSoup('<a></a>');
    assert.equal(soup.string, undefined);
    done();
  });
});

describe('sibling', function() {
  it('should be OK without sibling', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    assert.equal(soup.previousSibling, undefined);
    assert.equal(soup.nextSibling, undefined);
    assert.equal(soup.contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].nextSibling, undefined);
    assert.equal(soup.contents[0].contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].contents[0].nextSibling, undefined);
    assert.equal(soup.previousSiblings, undefined);
    assert.equal(soup.nextSiblings, undefined);
    assert.equal(soup.contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].nextSiblings, undefined);
    assert.equal(soup.contents[0].contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].contents[0].nextSiblings, undefined);
    done();
  });

  it('should be OK with sibling', function(done) {
    var soup = new JSSoup('<a>hello</a><b>df</b><c>df</c>');
    assert.equal(soup.contents[0].previousSibling, undefined);
    assert.equal(soup.contents[0].nextSibling.name, 'b');
    assert.equal(soup.contents[1].previousSibling.name, 'a');
    assert.equal(soup.contents[1].nextSibling.name, 'c');
    assert.equal(soup.contents[2].previousSibling.name, 'b');
    assert.equal(soup.contents[2].nextSibling, undefined);
    assert.equal(soup.contents[0].previousSiblings, undefined);
    assert.equal(soup.contents[0].nextSiblings[0].name, 'b');
    assert.equal(soup.contents[0].nextSiblings[1].name, 'c');
    assert.equal(soup.contents[1].previousSiblings[0].name, 'a');
    assert.equal(soup.contents[1].nextSiblings[0].name, 'c');
    assert.equal(soup.contents[2].previousSiblings[0].name, 'a');
    assert.equal(soup.contents[2].previousSiblings[1].name, 'b');
    assert.equal(soup.contents[2].nextSiblings, undefined);
    done();
  });
});

describe('attrs', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2 h3">hello</a>');
    assert.ok(soup.contents[0].attrs);
    done();
  });
});


describe('extract', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var a = soup.contents[0];
    a.extract();
    assert.equal(a.parent, null);
    assert.equal(soup.contents.length, 0);
    done();
  });

  it('should be OK with SoupString', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a>');
    var text = soup.find(undefined, undefined, 'hello');
    text.extract();
    assert.equal(soup.contents[0].nextElement, null);
    assert.equal(soup.descendants.length, 1);
    assert.equal(soup.text, '');
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    a.extract();
    assert.equal(soup.nextElement, b);
    assert.equal(soup, b.previousElement);
    assert.equal(b.nextElement.nextElement, c);
    assert.equal(before, soup.descendants.length + 2);
    assert.equal(a.nextElement.toString(), '1');
    assert.equal(a.nextElement.nextElement, null);
    done();
  });

  it('should be OK with no sub contents', function(done) {
    var soup = new JSSoup('<a class="hi"></a><b></b><c></c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.equal(soup.nextElement, a);
    assert.equal(soup, a.previousElement);
    assert.equal(a.nextElement, c);
    assert.equal(c.previousElement, a);
    assert.equal(before, soup.descendants.length + 1);
    assert.equal(a.nextElement.nextElement, null);
    assert.equal(b.nextElement, null);
    assert.equal(b.previousElement, null);
    assert.equal(b.parent, null);
    done();
  });

  it('should be OK with combine function', function(done) {
    var soup = new JSSoup('<a class="hi">1</a><b>2</b><c>3</c>');
    var a = soup.contents[0];
    var b = soup.contents[1];
    var c = soup.contents[2];
    var before = soup.descendants.length;
    b.extract();
    assert.equal(soup.text, '13');
    soup.append(b);
    assert.equal(soup.text, '132');
    assert.equal(before, soup.descendants.length);
    assert.equal(c.nextElement.nextElement, b);
    assert.equal(b.previousElement.previousElement, c);
    done();
  });

});

describe('find', function() {
  it('should be OK to find div with DOCTYPE', function(done) {
    var text = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html><head><title>The Dormouse's story</title></head>
      <body>
      <div class="one">One</div>
      </body>
      </html>
    `;
    var soup = new JSSoup(text);
    var tag = soup.find('div');
    assert.equal(tag.text, 'One');
    done();
  });
})

describe('findAll', function() {
  it('should find all elements', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll();
    assert.equal(ret.length, 1);
    soup = new JSSoup(data);
    ret = soup.findAll();
    assert.equal(ret.length, 19);
    ret = soup.findAll('a');
    assert.equal(ret.length, 3);
    ret = soup.findAll('p');
    assert.equal(ret.length, 3);
    ret = soup.findAll('head');
    assert.equal(ret.length, 1);
    ret = soup.findAll('title');
    assert.equal(ret.length, 1);
    ret = soup.findAll('span');
    assert.equal(ret.length, 4);
    ret = soup.findAll('div');
    assert.equal(ret.length, 4);
    ret = soup.findAll('');
    assert.equal(ret.length, 0);
    done();
  });

  it('should be OK with only name as argument', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll('a');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'a');
    ret = soup.findAll('b');
    assert.equal(ret.length, 0);
    done();
  });

  it('should be OK with only string as argument', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll(undefined, undefined, 'hello');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].constructor.name, 'SoupString');
    ret = soup.findAll('a', undefined, 'hello');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].string, 'hello');
    assert.equal(ret[0].name, 'a');
    soup = new JSSoup(data);
    ret = soup.findAll(undefined, undefined, '...');
    assert.equal(ret.length, 1);
    assert.equal(ret[0], '...');
    ret = soup.findAll('p', undefined, '...');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'p');
    assert.equal(ret[0].string, '...');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('p', 'title');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'p');
    var ret2 = soup.findAll('p', {class: 'title'});
    assert.equal(ret2.length, 1);
    assert.equal(ret[0], ret2[0]);
    ret = soup.findAll('p', 'story');
    assert.equal(ret.length, 2);
    done();
  });

  it('should be OK with multiple classes', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('span', 'one');
    assert.equal(ret.length, 2);
    assert.equal(ret[0].name, 'span');
    var ret2 = soup.findAll('span', 'two');
    assert.equal(ret2.length, 2);
    assert.equal(ret2[0].name, 'span');
    var ret3 = soup.findAll('span', 'three');
    assert.equal(ret3.length, 2);
    assert.equal(ret3[0].name, 'span');
    done();
  });

  it('should be OK with whitespace in class definition', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('div', 'whitespace');
    assert.equal(ret.length, 4);
    assert.equal(ret[0].name, 'div');
    var ret2 = soup.findAll('div', ['whitespace']);
    assert.equal(ret2.length, 4);
    assert.equal(ret2[0].name, 'div');
    var ret3 = soup.findAll('div', {class: 'whitespace'});
    assert.equal(ret3.length, 4);
    assert.equal(ret3[0].name, 'div');
    var ret4 = soup.findAll('div', {class: ['whitespace']});
    assert.equal(ret4.length, 4);
    assert.equal(ret4[0].name, 'div');
    done();
  });

  it('should be OK with whitespace in class selector', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('div', 'whitespace ');
    assert.equal(ret.length, 4);
    assert.equal(ret[0].name, 'div');
    var ret2 = soup.findAll('div', ['whitespace ']);
    assert.equal(ret2.length, 4);
    assert.equal(ret2[0].name, 'div');
    var ret3 = soup.findAll('div', {class: 'whitespace '});
    assert.equal(ret3.length, 4);
    assert.equal(ret3[0].name, 'div');
    var ret4 = soup.findAll('div', {class: ['whitespace ']});
    assert.equal(ret4.length, 4);
    assert.equal(ret4[0].name, 'div');
    done();
  });

});

describe('prev next', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var cur = soup;
    var last = null;
    while (cur) {
      last = cur;
      cur = cur.nextElement;
    }
    while (last) {
      last = last.previousElement;
    }
    done();
  });
});

describe('descendants', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    assert.notEqual(soup.descendants, soup.descendants);
    var cur = soup.nextElement;
    for (let i of soup.descendants) {
      assert.equal(i, cur);
      cur = cur.nextElement;
    }
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<div><a></a><b></b></div>');
    var a = soup.nextElement.nextElement;
    assert.equal(a.descendants.length, 0);
    done();
  });
});

describe('getText', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>1<b>2</b>3</a>');
    assert.equal(soup.getText(), '123');
    assert.equal(soup.getText('|'), '1|2|3');
    assert.equal(soup.getText(), soup.text);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<div><a>1<b>2</b>3</a><c>4</c></div>');
    assert.equal(soup.getText(), '1234');
    assert.equal(soup.getText('|'), '1|2|3|4');
    assert.equal(soup.getText(), soup.text);
    done();
  });

  it('should preserve whitespace is set ignoreWhitespace false', function(done) {
    const html = `<p>
  <span contenteditable="false">blabla bla bla</span>
\t<strong style="color: rgb(203, 65, 64);"> </strong> here a double space bla bla
</p>`
    var soup = new JSSoup(html, false);
    assert.equal(soup.getText(), '\n  blabla bla bla\n\t  here a double space bla bla\n');
    done();
  });
});

describe('prettify', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a>1<b>2</b>3</a>');
    assert.equal(soup.prettify(), '<a>\n 1\n <b>\n  2\n </b>\n 3\n</a>');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify(), '<a class="h1 h2" id="h3 h4">\n 1\n <b>\n  2\n </b>\n 3\n</a>');
    done();
  });

  it('should be OK with indent argument', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify('', ''), '<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    assert.equal(soup.prettify('\t', ''), '<a class="h1 h2" id="h3 h4">\t1\t<b>\t\t2\t</b>\t3</a>');
    assert.equal(soup.prettify('\t', ' '), '<a class="h1 h2" id="h3 h4"> \t1 \t<b> \t\t2 \t</b> \t3 </a>');
    done();
  });

  it('should be OK with comments', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>');
    assert.equal(soup.prettify('',''), '<a class="h1 h2" id="h3 h4"><!--<label "text" </label> -->1<b>2</b>3</a>');
    done();
  });

  it('should be OK with doctype', function(done) {
   var text = `
    <!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `
    var soup = new JSSoup(text);
    assert.equal(soup.prettify('',''), `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`);
    done();
  });

  it('should be able to skip DOCTYPE', function(done) {
   var text = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
        <div>
        </div>
    </body>
    </html>
    `
    var soup = new JSSoup(text);
    assert.equal(soup.prettify('',''), `<!DOCTYPE HTML><html><head></head><body><div></div></body></html>`);
    soup.nextElement.extract();
    assert.equal(soup.find("html").prettify('',''), `<html><head></head><body><div></div></body></html>`);
    done();
  });

  it('should be able to prettify for tag in builder', function(done) {
    var soup = new JSSoup('<meta charset="utf-8" />');
    assert.equal(soup.prettify('', ''), `<meta charset="utf-8" />`);
    done();
  });

  it('should be able to prettify tag not in builder', function(done) {
    var soup = new JSSoup('<script></script>');
    assert.equal(soup.prettify('', ''), `<script></script>`);
    done();
  });

  it('should be able to handle br', function(done) {
    var soup = new JSSoup('<br>');
    assert.equal(soup.prettify('', ''), `<br />`);
    soup = new JSSoup('<br/>');
    assert.equal(soup.prettify('', ''), `<br />`);
    done();
  });
});

describe('append', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b>3</a>');
    var text2 = soup.find(undefined, undefined, '2');
    assert.equal(text2, '2');
    text2.extract();
    var b = soup.find('b');
    assert.equal(b.contents.length, 0);
    assert.equal(text2.parent, null);
    var a = soup.find('a');
    a.append(text2);
    assert.equal(b.nextSibling, '32');
    assert.equal(b.nextSibling.nextSibling, null);
    assert.equal(b.nextElement, '32');
    assert.equal(b.nextElement.nextElement, null);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b></a>');
    var text2 = soup.find(undefined, undefined, '2');
    assert.equal(text2, '2');
    text2.extract();
    var b = soup.find('b');
    assert.equal(b.contents.length, 0);
    assert.equal(text2.parent, null);
    var a = soup.find('a');
    a.append(text2);
    assert.equal(b.nextSibling, '2');
    assert.equal(b.nextSibling.nextSibling, null);
    assert.equal(b.nextElement, '2');
    assert.equal(b.nextElement.nextElement, null);
    assert.equal(text2.parent, a);
    assert.equal(text2.previousSibling, b);
    assert.equal(text2.previousElement, b);
    assert.equal(text2.nextSibling, null);
    assert.equal(text2.nextElement, null);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="h1 h2" id="h3 h4">1<b>2</b><c>3</c></a>');
    var a = soup.find('a');
    var b = soup.find('b');
    var c = soup.find('c');
    b.extract();
    a.append(b);
    assert.equal(c.nextSibling, b);
    assert.equal(c.nextSibling.nextSibling, undefined);
    assert.equal(b.nextSibling, null);
    assert.equal(c.nextElement, '3');
    assert.equal(c.nextElement.nextElement, b);
    assert.equal(b.nextElement, '2');
    assert.equal(b.nextElement.nextElement, null);
    assert.equal(b.nextElement.previousElement, b);
    assert.equal(b.previousElement, '3');
    assert.equal(b.parent, a);
    done();
  });
});

describe('findNextSiblings', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSiblings = span.findNextSiblings('span');
    assert.equal(nextSiblings.length, 3);
    assert.equal(nextSiblings[0].name, 'span');
    assert.equal(nextSiblings[1].name, 'span');
    assert.equal(nextSiblings[2].name, 'span');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSiblings = span.findNextSiblings('span', 'one');
    assert.equal(nextSiblings.length, 1);
    assert.equal(nextSiblings[0].name, 'span');
    done();
  });
});

describe('findNextSibling', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSibling = span.findNextSibling('span');
    assert.equal(nextSibling.name, 'span');
    assert.equal(nextSibling.text, 'Two');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span');
    var nextSibling = span.findNextSibling('span', 'one');
    assert.equal(nextSibling.name, 'span');
    assert.equal(nextSibling.text, 'One Two Three');
    done();
  });
});

describe('findPreviousSiblings', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSiblings = span.findPreviousSiblings('span');
    assert.equal(previousSiblings.length, 2);
    assert.equal(previousSiblings[0].name, 'span');
    assert.equal(previousSiblings[1].name, 'span');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSiblings = span.findPreviousSiblings('span', 'one');
    assert.equal(previousSiblings.length, 1);
    assert.equal(previousSiblings[0].name, 'span');
    done();
  });
});

describe('findPreviousSibling', function() {
  it('should be OK', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSibling = span.findPreviousSibling('span');
    assert.equal(previousSibling.name, 'span');
    assert.equal(previousSibling.text, 'Two');
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var span = soup.find('span', 'three');
    var previousSibling = span.findPreviousSibling('span', 'one');
    assert.equal(previousSibling.name, 'span');
    assert.equal(previousSibling.text, 'One');
    done();
  });
});

describe('insert', function() {
  it('should throw exception for null element', function(done) {
    var soup = new JSSoup(data);
    expect(() => {soup.insert(0, null)}).to.throw();
    done();
  });

  it('should throw exception for node itself', function(done) {
    var soup = new JSSoup(data);
    var tag = soup.find('div');
    expect(() => {tag.insert(0, tag)}).to.throw();
    done();
  });

  it('should throw exception trying to insert into string', function(done) {
    var soup = new JSSoup(data);
    var p = soup.find('p');
    expect(() => {p.string.insert(0, 'new node')}).to.throw();
    done();
  });


  it('should throw exception trying to insert at negative position', function(done) {
    var soup = new JSSoup(data);
    var p = soup.find('p');
    var div = soup.find('div');
    expect(() => {p.insert(-1, div)}).to.throw();
    done();
  });

  it('should be able to insert string', function(done) {
    var soup = new JSSoup('<div><p>hello</p></div>');
    var p = soup.find('p');
    p.insert(1, ' world');
    assert.equal(p.getText(), 'hello world');
    done();
  });


  it('should not change if inserting child to current index', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(1, p2);
    assert.equal(oldText, soup.getText());
    done();
  });

  it('should change order if inserting child to begin', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var oldText = soup.getText();
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(0, p2);
    assert.equal(soup.getText(), 'p2p1p3');
    done();
  });

  it('should change order if inserting child to end', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    div.insert(100, p2);
    assert.equal(soup.getText(), 'p1p3p2');
    done();
  });

  it('should be able to insert at the end', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p2 = soup.find('p', {'id': 'p2'});
    soup.insert(100, p2);
    assert.equal(soup.getText(), 'p1p3p2');
    assert.equal(div.nextSibling.prettify('', ''), '<p id="p2">p2</p>');
    done();
  });

  it('should be able to insert node from another DOM', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    var div = fromSoup.find('div');
    var span = toSoup.find('span');
    span.insert(100, div);
    assert.equal(span.prettify('', ''), '<span><a href="http"></a><div><p id="p1">p1</p></div></span>');
    done();
  });

  it('should be able to insert JSSoup', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
    </div>
    `
    var toHtml = `
    <span>
      <a href="http" />
    </span>
    `
    var fromSoup = new JSSoup(html);
    var toSoup = new JSSoup(toHtml);
    toSoup.insert(100, fromSoup);
    assert.equal(toSoup.prettify('', ''), '<span><a href="http"></a></span><div><p id="p1">p1</p></div>');
    done();
  });
});


describe('replaceWith', function() {
  it('should throw exception if parent is null', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var p1 = soup.find('p', {'id': 'p1'});
    var p2 = soup.find('p', {'id': 'p2'});
    p1.extract();
    expect(() => {p1.replaceWith(p2)}).to.throw();
    done();
  });

  it('should throw exception if replace with one itself', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var old = soup.prettify();
    var p1 = soup.find('p', {'id': 'p1'});
    p1.replaceWith(p1);
    assert.equal(old, soup.prettify());
    done();
  });

  it('should throw exception if replace with ones parent', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    expect(() => {p1.replaceWith(div)}).to.throw();
    done();
  });

  it('should be able to replace one with another', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
      <p id="p3">p3</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    var p2 = soup.find('p', {'id': 'p2'});
    p1.replaceWith(p2);
    assert.equal(div.prettify('', ''), '<div><p id="p2">p2</p><p id="p3">p3</p></div>');
    done();
  });

  it('should be able to replace SoupString', function(done) {
    var html = `
    <div>
      <p id="p1">p1</p>
      <p id="p2">p2</p>
    </div>
    `
    var soup = new JSSoup(html);
    var div = soup.find('div');
    var p1 = soup.find('p', {'id': 'p1'});
    p1.string.replaceWith("hello");
    assert.equal(div.prettify('', ''), '<div><p id="p1">hello</p><p id="p2">p2</p></div>');
    done();
  });


});
