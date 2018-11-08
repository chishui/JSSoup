const assert = require('assert');
import JSSoup from '../lib/jssoup';

const data = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
    assert.equal(soup.descendants.length, 37);
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
    assert.equal(soup.nextElement.nextElement.prettify('',''), `<html><head></head><body><div></div></body></html>`);
    soup.nextElement.extract();
    assert.equal(soup.nextElement.prettify('',''), `<html><head></head><body><div></div></body></html>`);
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
