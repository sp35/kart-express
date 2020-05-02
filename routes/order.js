const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');
const Order = require('../models/order');
const {User, Shopper, Deliverer} = require('../models/users')

/* GET home page. */
router.get('/product/:id', isShopperLoggedIn, function(req, res, next) {
    var productId = req.params.id;
    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/');
        }
        User.find({city: req.user.city}, function(err, docs) {
            if (err) {
                return res.redirect('/');
            }
            var ids = docs.map(function(doc) { return doc._id; });
            Deliverer.findOne({user: {$in: ids}}, function(err, deliverer) {
                if (err) {
                    return res.redirect('/');
                }
                Shopper.findOne({user: req.user._id}, function(err, shopper) {
                    if (err) {
                        return res.redirect('/');
                    }
                    var order = new Order({
                        product: productId,
                        shopper: shopper._id,
                        deliverer: deliverer._id,
                    });
                    order.save();
                    res.redirect('/');
                });
            })
        })
     });
});

router.get('/cancel/:id', isShopperLoggedIn, function(req, res, next) {
    Order.findById(req.params.id, async function(err, order){
        if(err){
            return res.redirect('/');
        }
        const shopper = await Shopper.findById(order.shopper._id);
        if (!(shopper.user.equals(req.user._id))){
            console.log('Not the shopper');
            return res.redirect('/');
        }
        if ( !(order.accepted)){
            order.remove();
        }
        return res.redirect('/order/view/recent');
    });
});

router.get('/view/recent', isShopperLoggedIn, function(req, res, next) {
    Shopper.findOne({user: req.user._id}, function(err, shopper){
        if (err) {
            return res.redirect('/');
        }
        Order.find({shopper: shopper._id, delivered: false}, async function(err, docs){
            if (err) {
                return res.redirect('/');
            }
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['deliverer'] = await Deliverer.findById(docs[i].deliverer);
                docs[i]['deliverer']['user'] = await User.findById(docs[i].deliverer.user._id);
                docs[i]['shopper'] = shopper;
                docs[i]['shopper']['user'] = req.user;
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('shopper/orders', { orders: orders, status: {recent: true} });
        });
    });
});

router.get('/view/past', isShopperLoggedIn, function(req, res, next) {
    Shopper.findOne({user: req.user._id}, function(err, shopper){
        if (err) {
            return res.redirect('/');
        }
        Order.find({shopper: shopper._id, delivered: true}, async function(err, docs){
            if (err) {
                return res.redirect('/');
            }
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['deliverer'] = await Deliverer.findById(docs[i].deliverer);
                docs[i]['deliverer']['user'] = await User.findById(docs[i].deliverer.user._id);
                docs[i]['shopper'] = shopper;
                docs[i]['shopper']['user'] = req.user;
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('shopper/orders', { orders: orders, status: {past: true} });
        });
    });
});

module.exports = router;

function isShopperLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        Shopper.findOne({user: req.user._id}, function(err, shopper) {
            if (err){
                return res.redirect('/');
            }
            if (shopper){
                return next();
            }
        });
    }
    else {
        res.redirect('/users/signin');
    }
}
