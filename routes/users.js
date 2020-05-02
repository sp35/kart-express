const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const {User, Shopper, Deliverer} = require('../models/users');

router.get('/profile', isLoggedIn, async (req, res, next) => {
    await Shopper.findOne({user: req.user._id}, function(err, shopper) {
        if (err) {
            return res.redirect('/');
        }
        if (shopper){
            shopper['accType'] = 'Shopper'
            shopper['user'] = req.user;
            return res.render('users/profile', { person: shopper });
        }
    });
    await Deliverer.findOne({user: req.user._id}, function(err, deliverer) {
        if (err) {
            return res.redirect('/');
        }
        if (deliverer){
            deliverer['accType'] = 'Deliverer'
            deliverer['user'] = req.user;
            return res.render('users/profile', { person: deliverer });
        }
    });
});

const csrfProtection = csrf();
router.use(csrfProtection);

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('users/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/users/signup',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/users/profile');
    }
});

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('users/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/users/signin',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/users/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}