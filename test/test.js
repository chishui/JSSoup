const assert = require('assert');
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
  </body>
  </html>
`
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
    assert.equal(soup.contents.length, 0);
    done();
  });

  it('should be OK', function(done) {
    var soup = new JSSoup('<a class="hi">hello</a><b>asdf</b>');
    assert.equal(soup.string, undefined);
    var a = soup.contents[0];
    a.extract();
    assert.equal(soup.contents.length, 1);
    assert.equal(soup.string, 'asdf');
    done();
  });
});

describe('findAll', function() {
  it('should find all for simple data', function(done) {
    var soup = new JSSoup('<a>hello</a>');
    var ret = soup.findAll();
    assert.equal(ret.length, 2);
    ret = soup.findAll('a');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'a');
    ret = soup.findAll('b');
    assert.equal(ret.length, 0); 
    done();
  });

  it('should find all for big data', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll();
    // has one root element
    assert.equal(ret.length, 12);
    ret = soup.findAll('a');
    assert.equal(ret.length, 3);
    ret = soup.findAll('p');
    assert.equal(ret.length, 3);
    ret = soup.findAll('head');
    assert.equal(ret.length, 1);
    ret = soup.findAll('title');
    assert.equal(ret.length, 1);
    ret = soup.findAll('');
    assert.equal(ret.length, 0);
    done();
  });

  it('should be OK with attributes', function(done) {
    var soup = new JSSoup(data);
    var ret = soup.findAll('p', 'title');
    assert.equal(ret.length, 1);
    assert.equal(ret[0].name, 'p')
    var ret2 = soup.findAll('p', {class: 'title'});
    assert.equal(ret2.length, 1);
    assert.equal(ret[0], ret2[0])
    ret = soup.findAll('p', 'story');
    assert.equal(ret.length, 2);
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
