JSSoup
=============================
I'm a fan of Python library BeautifulSoup. It's feature-rich and very easily to use.  
But when I am working on a small react-native project, and I tried to find a HTML parser library easily to use 
like BeautifulSoup, I failed.  
So I want to write a HTML parser library which can be so easy to use just like BeautifulSoup in Javascript.  
JSSoup uses [tautologistics/node-htmlparser](https://github.com/tautologistics/node-htmlparser) as HTML dom parser, 
and creates a series of BeautifulSoup like API on top of it.  

----------------------------
# How to use JSSoup
### Make Soup
```
var soup = JSSoup('<html><head>hello</head></html>');
```
### Navigation
#### .previousElement, .nextElement
```
var data = `
<div>
  <a>1</a>
  <b>2</b>
  <c>3</c>
</div>
`
var soup = JSSoup(data);
var div = soup.nextElement;
var b = div.nextElement.nextElement;
// b.string: '2'
var a = b.previousElement;
// a.string: '1'
```
#### .previousSibling, .nextSibling
```
var soup = JSSoup(data);
var div = soup.nextElement;
var a = div.nextElement;
var b = a.nextSibling;
var c = b.nextSibling;
c.nextSibling == undefined;
```
#### .contents
```
div.contents
// [<a>1</a>, <b>2</b>, <c>3</c>]
```
#### .parent
```
div.parent == soup
```
#### .string
```
b.string == '2';
var soup = JSSoup('<html><head>hello</head></html>');
soup.string == 'hello';
```
### Edit
#### .extract()
```
b.extract();
div.contents
// [<a>1</a>, <b>2</b>, <c>3</c>]
```
### Search
#### .findAll()
```
var data = `
<div>
  <div class="h1"></div>
  <a>hello</a>
</div>
`
var soup = JSSoup(data);
soup.findAll('a')
// [<a>hello</a>]
soup.findAll('div', 'h1')
// [<div class="h1"></div>]
```

# Run Test
```
npm test
```
# Status
There's a lot of work need to be done.

