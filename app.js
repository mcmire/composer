
var express = require('express')
  , app = express()
  , port = 5010

app.use(express.static('public'))

app.listen(port)
console.log('== Composer is listening on port ' + port + '.')
