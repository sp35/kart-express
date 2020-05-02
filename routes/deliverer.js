const express = require('express');
const router = express.Router();

const {Product} = require('../models/product');
const Order = require('../models/order');
const {User, Shopper, Deliverer} = require('../models/users')
const sendMail = require('../utils/sendgridMails')

/* GET home page. */
router.get('/', isDelivererLoggedIn, function(req, res, next) {
    Deliverer.findOne({user: req.user._id}, function(err, deliverer){
        Order.find({deliverer: deliverer._id, accepted: false}, async function(err, docs){
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['shopper'] = await Shopper.findById(docs[i].shopper);
                docs[i]['shopper']['user'] = await User.findById(docs[i].shopper.user._id);
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('deliverer/index', { orders: orders, status: {} });
        });
    });
});

router.get('/accept/:id', isDelivererLoggedIn, function(req, res, next) {
    Order.findById(req.params.id, async function(err, order){
        if(err){
            return res.redirect('/deliverer');
        }
        const deliverer = await Deliverer.findById(order.deliverer);
        const shopper = await Shopper.findById(order.shopper);
        const product = await Product.findById(order.product);
        const shopperUser = await User.findById(shopper.user);
        if (!(deliverer.user.equals(req.user._id))){
            console.log('Not the deliverer')
            return res.redirect('/deliverer');
        }
        order.accepted = true;
        order.save()

        const subject = `Order- ${product.title} Accepted`
        const text = `Order accepted!`
        await sendMail(shopperUser.email, subject, text);
        return res.redirect('/deliverer');
    });
});

router.get('/mark-arrived/:id', isDelivererLoggedIn, function(req, res, next) {
    Order.findById(req.params.id, async function(err, order){
        if(err){
            return res.redirect('/deliverer');
        }
        const deliverer = await Deliverer.findById(order.deliverer);
        const shopper = await Shopper.findById(order.shopper);
        const product = await Product.findById(order.product);
        const shopperUser = await User.findById(shopper.user);
        if (!(deliverer.user.equals(req.user._id))){
            console.log('Not the deliverer')
            return res.redirect('/deliverer');
        }
        order.arrived = true;
        order.save()
        
        const subject = `Order- ${product.title} Arrived`
        const text = `Order arrived at facility, will be delivered soon!`
        await sendMail(shopperUser.email, subject, text);
        return res.redirect('/deliverer/view/accepted');
    });
});

router.get('/mark-delivered/:id', isDelivererLoggedIn, function(req, res, next) {
    Order.findById(req.params.id, async function(err, order){
        if(err){
            return res.redirect('/deliverer');
        }
        const deliverer = await Deliverer.findById(order.deliverer);
        const shopper = await Shopper.findById(order.shopper);
        const product = await Product.findById(order.product);
        const shopperUser = await User.findById(shopper.user);
        if (!(deliverer.user.equals(req.user._id))){
            console.log('Not the deliverer')
            return res.redirect('/deliverer');
        }
        order.delivered = true;
        order.deliveredDateTime = Date.now()
        order.save()
        
        const subject = `Order- ${product.title} Delivered`
        const text = `Order was delivered to you`
        await sendMail(shopperUser.email, subject, text);
        return res.redirect('/deliverer/view/arrived');
    });
});

router.get('/view/accepted', isDelivererLoggedIn, function(req, res, next) {
    Deliverer.findOne({user: req.user._id}, function(err, deliverer){
        Order.find({deliverer: deliverer._id, accepted: true, arrived: false, delivered: false}, async function(err, docs){
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['shopper'] = await Shopper.findById(docs[i].shopper);
                docs[i]['shopper']['user'] = await User.findById(docs[i].shopper.user._id);
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('deliverer/index', { orders: orders, status: {accepted: true} });
        });
    });
});

router.get('/view/arrived', isDelivererLoggedIn, function(req, res, next) {
    Deliverer.findOne({user: req.user._id}, function(err, deliverer){
        Order.find({deliverer: deliverer._id, accepted: true, arrived: true, delivered: false}, async function(err, docs){
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['shopper'] = await Shopper.findById(docs[i].shopper);
                docs[i]['shopper']['user'] = await User.findById(docs[i].shopper.user._id);
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('deliverer/index', { orders: orders, status: {arrived: true} });
        });
    });
});

router.get('/view/delivered', isDelivererLoggedIn, function(req, res, next) {
    Deliverer.findOne({user: req.user._id}, function(err, deliverer){
        Order.find({deliverer: deliverer._id, accepted: true, arrived: true, delivered: true}, async function(err, docs){
            for (var i = 0; i < docs.length; i++) {
                docs[i]['product'] = await Product.findById(docs[i].product);
                docs[i]['shopper'] = await Shopper.findById(docs[i].shopper);
                docs[i]['shopper']['user'] = await User.findById(docs[i].shopper.user._id);
            }
            var orders = [];
            var groupSize = 3;
            for (var i = 0; i < docs.length; i += groupSize) {
                orders.push(docs.slice(i, i + groupSize));
            }
            res.render('deliverer/index', { orders: orders, status: {delivered: true} });
        });
    });
});

module.exports = router;

function isDelivererLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        Deliverer.findOne({user: req.user._id}, function(err, deliverer) {
            if (err){
                return res.redirect('/');
            }
            if (deliverer){
                return next();
            }
        });
    }
    else {
        res.redirect('/');
    }
}
