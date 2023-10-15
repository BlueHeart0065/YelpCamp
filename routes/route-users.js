const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const WrapAsync = require('../utils/WrapAsync');

const router = express.Router();

const storeReturn = (req , res , next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

router.get('/register' , (req , res) => {
    res.render('register');
});

router.post('/register' , WrapAsync(async (req , res, next) => {
    try{
        const {username , email , password} = req.body;
    
        const user = new User({username , email});
        const registeredUser = await User.register(user , password);
        
        req.login(registeredUser , (err) => {
            if(err){
                return next(err);
            }
            req.flash('success' , 'Welcome to YelpCamp !!');
            res.redirect('/campgrounds');
        });
        
    } catch(err){
        req.flash('failure' , err.message);
        res.redirect('/register');
    }
}));

router.get('/login' , (req , res) => {
    res.render('login');
});

router.post('/login' , storeReturn ,passport.authenticate('local' , {failureFlash : true , failureRedirect : '/login'}) ,(req , res) => {
    req.flash('success' , `Welcome to YelpCamp ${req.session.passport.user} !!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout' , (req , res) => {
    req.logOut(function (err) {
        if(err){
            return next(err);
        }
        req.flash('success' , 'Logged out!!');
        res.redirect('/campgrounds');
    });
}); 


module.exports = router;