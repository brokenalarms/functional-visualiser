var express = require ('express');
var router = express.Router();

/* GET home page. */
router.get('*', function(req, res, next) {
  App.render('index.html');
});

module.exports = router;
