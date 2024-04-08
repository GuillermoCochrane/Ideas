var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ideas' });
});

router.get('/:id', function(req, res, next) {
  res.render(req.params.id);
});

router.get('/sliders/:id', function(req, res, next) {
  let url =`s${req.params.id}`;
  res.render(url);
});

router.get('/details/:id', function(req, res, next) {
  let url =`d${req.params.id}`;
  res.render(url);
});

module.exports = router;
