const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');
const {Deliverer} = require('../models/users')

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (req.isAuthenticated()){
    await Deliverer.findOne({user: req.user._id}, function(err, deliverer){
      if (err){
        res.redirect('/');
      }
      if (deliverer){
        res.redirect('/deliverer');
      }
    });
  }
  Product.find( function(err, docs) {
    var products = [];
    var groupSize = 3;
    for (var i = 0; i < docs.length; i += groupSize) {
      products.push(docs.slice(i, i + groupSize));
    }
    res.render('shop/index', { products: products });
  });
});
    
module.exports = router;
