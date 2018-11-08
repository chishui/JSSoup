const JSSoup = require('../dist/lib/jssoup').default

const data = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <div class="one">One</div>
  </body>
  </html>
`

var soup = new JSSoup(data)
var tag = soup.find('div', {'class': 'one'})
console.log(tag.text)