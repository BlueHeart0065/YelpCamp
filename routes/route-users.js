const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const WrapAsync = require('../utils/WrapAsync');
const users = require('../controllers/users');

const router = express.Router();

const storeReturn = (req , res , next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

router.route('/register')
    .get( users.registerPage )
    .post( WrapAsync(users.register));

router.route('/login')
    .get(users.loginPage)
    .post( storeReturn ,passport.authenticate('local' , {failureFlash : true , failureRedirect : '/login'}) , users.login);

router.get('/logout' , users.logout); 


module.exports = router;
