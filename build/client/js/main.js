'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _shiftParser = require('shift-parser');

var _shiftParser2 = _interopRequireDefault(_shiftParser);

var ast = (0, _shiftParser2['default'])('functional.js');

console.log(ast);
console.log('yo');