const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/register' , (req , res) => {
    res.render('register');
});

router.post('/register' , async (req , res) => {
    try{
        const {username , email , password} = req.body;
    
        const user = new User({username , email});
        await User.register(user , password);
        req.flash('success' , 'Welcome to YelpCamp !!');
        res.redirect('/campgrounds');
    } catch(err){
        req.flash('failure' , err.message);
        res.redirect('/register');
    }
})


module.exports = router;
