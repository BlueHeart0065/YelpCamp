const User = require('../models/user');


module.exports.registerPage = (req , res) => {
    res.render('register');
}

module.exports.register = async (req , res, next) => {
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
}

module.exports.loginPage = (req , res) => {
    res.render('login');
}

module.exports.login = (req , res) => {
    req.flash('success' , `Welcome to YelpCamp ${req.session.passport.user} !!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req , res) => {
    req.logOut(function (err) {
        if(err){
            return next(err);
        }
        req.flash('success' , 'Logged out!!');
        res.redirect('/campgrounds');
    });
}